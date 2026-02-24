"""Admin hotel management routes: CRUD, images, SEO, offers, pricing."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.hotel import Hotel, HotelVariant
from app.models.season import HotelOffer, Season
from app.models.admin import AdminAuditLog
from app.routes.admin_auth import get_current_admin, require_permission
from app.models.admin import AdminUser

router = APIRouter(prefix="/api/admin/hotels", tags=["admin-hotels"])


# --- Pydantic models ---

class HotelCreate(BaseModel):
    hotel_id: str
    name: str
    slug: str
    description: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    star_rating: int = 3
    address: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    base_price_dzd: float = 0
    sale_price_dzd: Optional[float] = None
    amenities: list = []
    images: list = []
    meta_data: dict = {}
    total_rooms: int = 20
    is_active: bool = True


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    star_rating: Optional[int] = None
    address: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    base_price_dzd: Optional[float] = None
    sale_price_dzd: Optional[float] = None
    amenities: Optional[list] = None
    images: Optional[list] = None
    meta_data: Optional[dict] = None
    total_rooms: Optional[int] = None
    available_rooms: Optional[int] = None
    is_active: Optional[bool] = None


class VariantCreate(BaseModel):
    variant_id: str
    nights: int
    base_price_dzd: float
    sale_price_dzd: Optional[float] = None
    includes_breakfast: bool = True
    includes_transfer: bool = False
    max_guests: int = 2
    is_active: bool = True


class VariantUpdate(BaseModel):
    base_price_dzd: Optional[float] = None
    sale_price_dzd: Optional[float] = None
    includes_breakfast: Optional[bool] = None
    includes_transfer: Optional[bool] = None
    max_guests: Optional[int] = None
    is_active: Optional[bool] = None


class OfferCreate(BaseModel):
    hotel_id: str
    title: str
    title_fr: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None
    starts_at: str  # ISO date
    ends_at: str
    discount_pct: Optional[float] = None
    discount_amount_dzd: Optional[float] = None
    is_active: bool = True


class SeasonCreate(BaseModel):
    name: str
    starts_at: str
    ends_at: str
    multiplier: float = 1.0
    color: str = "#3b82f6"
    is_active: bool = True


class BulkPricingUpdate(BaseModel):
    hotel_id: Optional[str] = None
    district: Optional[str] = None
    adjustment_pct: float


# --- Hotel CRUD ---

@router.get("")
async def list_hotels_admin(
    search: Optional[str] = None,
    district: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    limit: int = 50,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all hotels with admin details."""
    query = select(Hotel)
    if search:
        query = query.where(Hotel.name.ilike(f"%{search}%"))
    if district:
        query = query.where(Hotel.district == district)
    if is_active is not None:
        query = query.where(Hotel.is_active == is_active)

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.order_by(Hotel.hotel_id).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    hotels = result.scalars().all()

    hotel_list = []
    for h in hotels:
        hd = h.to_dict()
        # Count variants
        vc = await db.scalar(select(func.count()).select_from(HotelVariant).where(HotelVariant.hotel_id == h.hotel_id)) or 0
        hd["variant_count"] = vc
        hotel_list.append(hd)

    return {"hotels": hotel_list, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/{hotel_id}")
async def get_hotel_admin(
    hotel_id: str,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get hotel with all variants and offers."""
    hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == hotel_id))).scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # Variants
    vars_result = await db.execute(select(HotelVariant).where(HotelVariant.hotel_id == hotel_id).order_by(HotelVariant.nights))
    variants = vars_result.scalars().all()

    # Active offers
    offers_result = await db.execute(
        select(HotelOffer).where(HotelOffer.hotel_id == hotel_id).order_by(HotelOffer.created_at.desc())
    )
    offers = offers_result.scalars().all()

    hd = hotel.to_dict()
    hd["variants"] = [v.to_dict() for v in variants]
    hd["offers"] = [o.to_dict() for o in offers]
    return hd


@router.post("")
async def create_hotel(
    req: HotelCreate,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new hotel."""
    existing = (await db.execute(select(Hotel).where(Hotel.hotel_id == req.hotel_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Hotel ID already exists")

    hotel = Hotel(
        hotel_id=req.hotel_id,
        name=req.name,
        slug=req.slug,
        description=req.description,
        description_fr=req.description_fr,
        description_ar=req.description_ar,
        star_rating=req.star_rating,
        address=req.address,
        district=req.district,
        latitude=req.latitude,
        longitude=req.longitude,
        base_price_dzd=req.base_price_dzd,
        sale_price_dzd=req.sale_price_dzd or req.base_price_dzd,
        base_price_eur=round(req.base_price_dzd * 0.0067, 2),
        sale_price_eur=round((req.sale_price_dzd or req.base_price_dzd) * 0.0067, 2),
        amenities=req.amenities,
        images=req.images,
        meta_data=req.meta_data,
        total_rooms=req.total_rooms,
        available_rooms=req.total_rooms,
        is_active=req.is_active,
    )
    db.add(hotel)

    log = AdminAuditLog(actor_id=current_user.id, actor_email=current_user.email, action="create_hotel", entity_type="hotel", entity_id=req.hotel_id)
    db.add(log)

    await db.commit()
    await db.refresh(hotel)
    return {"hotel": hotel.to_dict()}


@router.patch("/{hotel_id}")
async def update_hotel(
    hotel_id: str,
    req: HotelUpdate,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    """Update hotel details."""
    hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == hotel_id))).scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hotel, key, value)

    # Recalculate EUR prices
    if "sale_price_dzd" in update_data or "base_price_dzd" in update_data:
        hotel.base_price_eur = round(hotel.base_price_dzd * 0.0067, 2)
        hotel.sale_price_eur = round((hotel.sale_price_dzd or hotel.base_price_dzd) * 0.0067, 2)

    log = AdminAuditLog(actor_id=current_user.id, actor_email=current_user.email, action="update_hotel", entity_type="hotel", entity_id=hotel_id, diff=update_data)
    db.add(log)

    await db.commit()
    return {"hotel": hotel.to_dict()}


@router.delete("/{hotel_id}")
async def deactivate_hotel(
    hotel_id: str,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete (deactivate) a hotel."""
    hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == hotel_id))).scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    hotel.is_active = False
    await db.commit()
    return {"success": True}


# --- Variants ---

@router.get("/{hotel_id}/variants")
async def list_variants(hotel_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HotelVariant).where(HotelVariant.hotel_id == hotel_id).order_by(HotelVariant.nights))
    return {"variants": [v.to_dict() for v in result.scalars().all()]}


@router.post("/{hotel_id}/variants")
async def create_variant(
    hotel_id: str, req: VariantCreate,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    variant = HotelVariant(
        variant_id=req.variant_id, hotel_id=hotel_id, nights=req.nights,
        base_price_dzd=req.base_price_dzd, sale_price_dzd=req.sale_price_dzd or req.base_price_dzd,
        base_price_eur=round(req.base_price_dzd * 0.0067, 2),
        sale_price_eur=round((req.sale_price_dzd or req.base_price_dzd) * 0.0067, 2),
        includes_breakfast=req.includes_breakfast, includes_transfer=req.includes_transfer,
        max_guests=req.max_guests, is_active=req.is_active,
    )
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    return {"variant": variant.to_dict()}


@router.patch("/{hotel_id}/variants/{variant_id}")
async def update_variant(
    hotel_id: str, variant_id: str, req: VariantUpdate,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    variant = (await db.execute(select(HotelVariant).where(HotelVariant.variant_id == variant_id))).scalar_one_or_none()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(variant, key, value)

    if "sale_price_dzd" in update_data or "base_price_dzd" in update_data:
        variant.base_price_eur = round(variant.base_price_dzd * 0.0067, 2)
        variant.sale_price_eur = round((variant.sale_price_dzd or variant.base_price_dzd) * 0.0067, 2)

    await db.commit()
    return {"variant": variant.to_dict()}


# --- Offers ---

@router.get("/offers/all")
async def list_all_offers(
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(HotelOffer).order_by(HotelOffer.created_at.desc()))
    return {"offers": [o.to_dict() for o in result.scalars().all()]}


@router.post("/offers")
async def create_offer(
    req: OfferCreate,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    offer = HotelOffer(
        hotel_id=req.hotel_id, title=req.title, title_fr=req.title_fr, label=req.label,
        description=req.description,
        starts_at=datetime.fromisoformat(req.starts_at), ends_at=datetime.fromisoformat(req.ends_at),
        discount_pct=req.discount_pct, discount_amount_dzd=req.discount_amount_dzd,
        is_active=req.is_active, created_by_id=current_user.id,
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return {"offer": offer.to_dict()}


@router.delete("/offers/{offer_id}")
async def delete_offer(
    offer_id: int,
    current_user: AdminUser = Depends(require_permission("hotels.write")),
    db: AsyncSession = Depends(get_db),
):
    offer = (await db.execute(select(HotelOffer).where(HotelOffer.id == offer_id))).scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    await db.delete(offer)
    await db.commit()
    return {"success": True}


# --- Seasons ---

@router.get("/seasons/all")
async def list_seasons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Season).order_by(Season.starts_at))
    return {"seasons": [s.to_dict() for s in result.scalars().all()]}


@router.post("/seasons")
async def create_season(
    req: SeasonCreate,
    current_user: AdminUser = Depends(require_permission("pricing.write")),
    db: AsyncSession = Depends(get_db),
):
    season = Season(
        name=req.name,
        starts_at=datetime.fromisoformat(req.starts_at),
        ends_at=datetime.fromisoformat(req.ends_at),
        multiplier=req.multiplier, color=req.color, is_active=req.is_active,
    )
    db.add(season)
    await db.commit()
    await db.refresh(season)
    return {"season": season.to_dict()}


@router.delete("/seasons/{season_id}")
async def delete_season(
    season_id: int,
    current_user: AdminUser = Depends(require_permission("pricing.write")),
    db: AsyncSession = Depends(get_db),
):
    season = (await db.execute(select(Season).where(Season.id == season_id))).scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    await db.delete(season)
    await db.commit()
    return {"success": True}


# --- Bulk Pricing ---

@router.post("/pricing/bulk-update")
async def bulk_pricing_update(
    req: BulkPricingUpdate,
    current_user: AdminUser = Depends(require_permission("pricing.write")),
    db: AsyncSession = Depends(get_db),
):
    """Bulk update pricing for hotels."""
    multiplier = 1 + (req.adjustment_pct / 100)

    query = select(HotelVariant)
    if req.hotel_id:
        query = query.where(HotelVariant.hotel_id == req.hotel_id)
    if req.district:
        hotel_ids_q = select(Hotel.hotel_id).where(Hotel.district == req.district)
        hotel_ids_result = await db.execute(hotel_ids_q)
        hotel_ids = [row[0] for row in hotel_ids_result.all()]
        query = query.where(HotelVariant.hotel_id.in_(hotel_ids))

    result = await db.execute(query)
    variants = result.scalars().all()
    updated = 0
    for v in variants:
        v.sale_price_dzd = round(v.sale_price_dzd * multiplier, 0)
        v.sale_price_eur = round(v.sale_price_dzd * 0.0067, 2)
        updated += 1

    # Also update hotel base prices
    h_query = select(Hotel)
    if req.hotel_id:
        h_query = h_query.where(Hotel.hotel_id == req.hotel_id)
    if req.district:
        h_query = h_query.where(Hotel.district == req.district)
    h_result = await db.execute(h_query)
    hotels = h_result.scalars().all()
    for h in hotels:
        if h.sale_price_dzd:
            h.sale_price_dzd = round(h.sale_price_dzd * multiplier, 0)
            h.sale_price_eur = round(h.sale_price_dzd * 0.0067, 2)

    log = AdminAuditLog(
        actor_id=current_user.id, actor_email=current_user.email,
        action="bulk_pricing_update", entity_type="pricing",
        diff={"adjustment_pct": req.adjustment_pct, "hotel_id": req.hotel_id, "district": req.district, "variants_updated": updated},
    )
    db.add(log)
    await db.commit()

    return {"success": True, "variants_updated": updated, "hotels_updated": len(hotels), "adjustment_pct": req.adjustment_pct}
