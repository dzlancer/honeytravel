"""Admin dashboard API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.hotel import Hotel, HotelVariant
from app.models.booking import Booking
from app.models.customer import Customer

router = APIRouter(prefix="/api/admin", tags=["admin"])


class PricingUpdate(BaseModel):
    hotel_id: Optional[str] = None
    district: Optional[str] = None
    adjustment_pct: float  # e.g. 10 for +10%, -5 for -5%


class CustomerNote(BaseModel):
    note: str
    tags: list[str] = []


@router.get("/dashboard")
async def dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Main admin dashboard statistics."""
    total_hotels = await db.scalar(select(func.count()).select_from(Hotel)) or 0
    active_hotels = await db.scalar(
        select(func.count()).select_from(Hotel).where(Hotel.is_active == True)
    ) or 0
    total_bookings = await db.scalar(select(func.count()).select_from(Booking)) or 0
    total_customers = await db.scalar(select(func.count()).select_from(Customer)) or 0

    revenue = await db.scalar(
        select(func.sum(Booking.final_price_dzd)).where(
            Booking.status.in_(["confirmed", "completed"])
        )
    ) or 0

    pending_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(Booking.status == "pending")
    ) or 0

    # Revenue by channel
    channel_q = select(
        Booking.source_channel,
        func.count(Booking.id).label("count"),
        func.sum(Booking.final_price_dzd).label("revenue"),
    ).group_by(Booking.source_channel)
    channel_result = await db.execute(channel_q)
    revenue_by_channel = [
        {"channel": row[0] or "direct", "bookings": row[1], "revenue": row[2] or 0}
        for row in channel_result.all()
    ]

    # Bookings by status
    status_q = select(
        Booking.status,
        func.count(Booking.id).label("count"),
    ).group_by(Booking.status)
    status_result = await db.execute(status_q)
    bookings_by_status = {row[0]: row[1] for row in status_result.all()}

    # Top hotels by bookings
    top_q = select(
        Booking.hotel_id,
        func.count(Booking.id).label("count"),
        func.sum(Booking.final_price_dzd).label("revenue"),
    ).group_by(Booking.hotel_id).order_by(func.count(Booking.id).desc()).limit(10)
    top_result = await db.execute(top_q)
    top_hotels = [
        {"hotel_id": row[0], "bookings": row[1], "revenue": row[2] or 0}
        for row in top_result.all()
    ]

    return {
        "total_hotels": total_hotels,
        "active_hotels": active_hotels,
        "total_bookings": total_bookings,
        "total_customers": total_customers,
        "total_revenue_dzd": revenue,
        "pending_bookings": pending_bookings,
        "avg_order_value": round(revenue / total_bookings, 0) if total_bookings else 0,
        "revenue_by_channel": revenue_by_channel,
        "bookings_by_status": bookings_by_status,
        "top_hotels": top_hotels,
    }


@router.post("/pricing/bulk-update")
async def bulk_pricing_update(update: PricingUpdate, db: AsyncSession = Depends(get_db)):
    """Bulk update pricing for hotels by district or individual hotel."""
    multiplier = 1 + (update.adjustment_pct / 100)

    query = select(HotelVariant)
    if update.hotel_id:
        query = query.where(HotelVariant.hotel_id == update.hotel_id)

    if update.district:
        hotel_ids_q = select(Hotel.hotel_id).where(Hotel.district == update.district)
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
    if update.hotel_id:
        h_query = h_query.where(Hotel.hotel_id == update.hotel_id)
    if update.district:
        h_query = h_query.where(Hotel.district == update.district)

    h_result = await db.execute(h_query)
    hotels = h_result.scalars().all()
    for h in hotels:
        h.sale_price_dzd = round(h.sale_price_dzd * multiplier, 0)
        h.sale_price_eur = round(h.sale_price_dzd * 0.0067, 2)

    await db.commit()

    return {
        "success": True,
        "variants_updated": updated,
        "hotels_updated": len(hotels),
        "adjustment_pct": update.adjustment_pct,
    }


@router.get("/customers")
async def list_customers(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List customers with search."""
    query = select(Customer)
    if search:
        query = query.where(
            Customer.full_name.ilike(f"%{search}%")
            | Customer.whatsapp_phone.ilike(f"%{search}%")
            | Customer.email.ilike(f"%{search}%")
        )
    query = query.order_by(Customer.created_at.desc())

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    customers = result.scalars().all()

    return {
        "customers": [c.to_dict() for c in customers],
        "total": total,
        "page": page,
    }


@router.patch("/customers/{customer_id}/notes")
async def update_customer_notes(
    customer_id: int,
    note: CustomerNote,
    db: AsyncSession = Depends(get_db),
):
    """Add notes/tags to a customer."""
    customer = (await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )).scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.notes = note.note
    customer.tags = note.tags
    await db.commit()

    return {"success": True, "customer": customer.to_dict()}
