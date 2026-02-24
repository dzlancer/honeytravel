"""Hotel API routes."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import Optional
from app.database import get_db
from app.models.hotel import Hotel, HotelVariant
from app.services.pricing import calculate_dynamic_price
from app.services.social_proof import (
    get_viewers_count, get_scarcity_info, get_bookings_today_count, get_recent_bookings
)

router = APIRouter(prefix="/api/hotels", tags=["hotels"])


@router.get("")
async def list_hotels(
    district: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    stars: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("sale_price_dzd"),  # sale_price_dzd, star_rating, name
    sort_order: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List hotels with filtering, sorting and pagination."""
    query = select(Hotel).where(Hotel.is_active == True)

    if district:
        query = query.where(Hotel.district == district)
    if min_price is not None:
        query = query.where(Hotel.sale_price_dzd >= min_price)
    if max_price is not None:
        query = query.where(Hotel.sale_price_dzd <= max_price)
    if stars:
        query = query.where(Hotel.star_rating == stars)
    if search:
        query = query.where(Hotel.name.ilike(f"%{search}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # Sort
    sort_col = getattr(Hotel, sort_by, Hotel.sale_price_dzd)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    # Paginate
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    hotels = result.scalars().all()

    return {
        "hotels": [h.to_dict() for h in hotels],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0,
    }


@router.get("/districts")
async def list_districts(db: AsyncSession = Depends(get_db)):
    """Get all districts with hotel counts."""
    query = select(
        Hotel.district, func.count(Hotel.id).label("count")
    ).where(Hotel.is_active == True).group_by(Hotel.district)

    result = await db.execute(query)
    districts = [{"name": row[0], "count": row[1]} for row in result.all()]
    return {"districts": districts}


@router.get("/social-proof")
async def get_social_proof():
    """Real-time social proof data."""
    return {
        "bookings_today": get_bookings_today_count(),
        "recent_bookings": get_recent_bookings(5),
    }


@router.get("/map-data")
async def get_map_data(db: AsyncSession = Depends(get_db)):
    """Get hotel locations for map display."""
    query = select(Hotel).where(Hotel.is_active == True)
    result = await db.execute(query)
    hotels = result.scalars().all()

    return {
        "hotels": [
            {
                "hotel_id": h.hotel_id,
                "name": h.name,
                "slug": h.slug,
                "district": h.district,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "star_rating": h.star_rating,
                "sale_price_dzd": h.sale_price_dzd,
                "image": h.images[0] if h.images else None,
            }
            for h in hotels
        ]
    }


@router.get("/{slug}")
async def get_hotel(slug: str, channel: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Get single hotel by slug with variants and social proof."""
    query = select(Hotel).where(Hotel.slug == slug)
    result = await db.execute(query)
    hotel = result.scalar_one_or_none()

    if not hotel:
        return {"error": "Hotel not found"}, 404

    # Get variants
    v_query = select(HotelVariant).where(
        and_(HotelVariant.hotel_id == hotel.hotel_id, HotelVariant.is_active == True)
    ).order_by(HotelVariant.nights)
    v_result = await db.execute(v_query)
    variants = v_result.scalars().all()

    # Dynamic pricing for each variant
    priced_variants = []
    for v in variants:
        pricing = calculate_dynamic_price(
            base_price=v.base_price_dzd,
            sale_price=v.sale_price_dzd,
            available_rooms=hotel.available_rooms,
            total_rooms=hotel.total_rooms,
            channel=channel,
        )
        variant_dict = v.to_dict()
        variant_dict["dynamic_pricing"] = pricing
        priced_variants.append(variant_dict)

    # Social proof
    viewers = get_viewers_count(hotel.hotel_id)
    scarcity = get_scarcity_info(hotel.available_rooms, hotel.name)

    hotel_dict = hotel.to_dict()
    hotel_dict["variants"] = priced_variants
    hotel_dict["social_proof"] = {
        "viewers": viewers,
        "scarcity": scarcity,
        "bookings_today": get_bookings_today_count(),
    }

    return hotel_dict


@router.get("/{slug}/availability")
async def check_availability(
    slug: str,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    rooms: int = Query(1, ge=1, le=10),
    channel: Optional[str] = None,
    returning_customer: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Check availability and calculate pricing."""
    from datetime import datetime

    query = select(Hotel).where(Hotel.slug == slug)
    result = await db.execute(query)
    hotel = result.scalar_one_or_none()
    if not hotel:
        return {"error": "Hotel not found"}, 404

    check_in_date = None
    if check_in:
        try:
            check_in_date = datetime.fromisoformat(check_in)
        except ValueError:
            pass

    v_query = select(HotelVariant).where(
        and_(HotelVariant.hotel_id == hotel.hotel_id, HotelVariant.is_active == True)
    ).order_by(HotelVariant.nights)
    v_result = await db.execute(v_query)
    variants = v_result.scalars().all()

    availability = []
    for v in variants:
        pricing = calculate_dynamic_price(
            base_price=v.base_price_dzd,
            sale_price=v.sale_price_dzd,
            available_rooms=hotel.available_rooms,
            total_rooms=hotel.total_rooms,
            check_in_date=check_in_date,
            channel=channel,
            is_returning_customer=returning_customer,
            room_count=rooms,
        )
        availability.append({
            "variant_id": v.variant_id,
            "nights": v.nights,
            "available": hotel.available_rooms >= rooms,
            "rooms_left": hotel.available_rooms,
            "pricing": pricing,
            "includes_breakfast": v.includes_breakfast,
            "includes_transfer": v.includes_transfer,
        })

    return {
        "hotel_id": hotel.hotel_id,
        "hotel_name": hotel.name,
        "check_in": check_in,
        "check_out": check_out,
        "rooms_requested": rooms,
        "availability": availability,
    }
