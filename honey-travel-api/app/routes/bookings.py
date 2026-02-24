"""Booking API routes."""
import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field
from typing import Optional
from app.database import get_db
from app.models.hotel import Hotel, HotelVariant
from app.models.customer import Customer
from app.models.booking import Booking
from app.services.pricing import calculate_dynamic_price

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def generate_booking_ref() -> str:
    """Generate unique booking reference like HNY-XXXXXX."""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=6))
    return f"HNY-{code}"


def generate_referral_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))


class BookingRequest(BaseModel):
    hotel_id: str
    variant_id: str
    check_in: str  # ISO date
    nights: int = Field(ge=1, le=30)
    guests_adults: int = Field(default=2, ge=1, le=10)
    guests_children: int = Field(default=0, ge=0, le=6)
    room_count: int = Field(default=1, ge=1, le=10)

    # Customer info
    full_name: str
    whatsapp_phone: str  # +213 format
    email: Optional[str] = None
    passport_number: Optional[str] = None
    city: Optional[str] = None

    # Payment
    payment_method: str = "reserve_pay_hotel"  # cib_d17, baridimob, cash, reserve_pay_hotel

    # Tracking
    source_channel: Optional[str] = None
    referral_code: Optional[str] = None
    special_requests: Optional[str] = None
    extras: list = Field(default_factory=list)

    # Meta CAPI
    meta_event_id: Optional[str] = None
    meta_fbp: Optional[str] = None
    meta_fbc: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str  # pending, confirmed, cancelled, completed, no_show
    payment_status: Optional[str] = None
    cancellation_reason: Optional[str] = None


@router.post("")
async def create_booking(req: BookingRequest, db: AsyncSession = Depends(get_db)):
    """Create a new pending booking."""
    # Validate hotel exists
    hotel_q = select(Hotel).where(Hotel.hotel_id == req.hotel_id)
    hotel = (await db.execute(hotel_q)).scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # Validate variant
    var_q = select(HotelVariant).where(HotelVariant.variant_id == req.variant_id)
    variant = (await db.execute(var_q)).scalar_one_or_none()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    # Check availability
    if hotel.available_rooms < req.room_count:
        raise HTTPException(status_code=400, detail="Not enough rooms available")

    # Find or create customer
    cust_q = select(Customer).where(Customer.whatsapp_phone == req.whatsapp_phone)
    customer = (await db.execute(cust_q)).scalar_one_or_none()

    is_returning = customer is not None

    if not customer:
        customer = Customer(
            whatsapp_phone=req.whatsapp_phone,
            full_name=req.full_name,
            email=req.email,
            passport_number=req.passport_number,
            city=req.city,
            referral_code=generate_referral_code(),
        )
        db.add(customer)
        await db.flush()

    # Calculate dynamic price
    check_in_date = datetime.fromisoformat(req.check_in)
    pricing = calculate_dynamic_price(
        base_price=variant.base_price_dzd,
        sale_price=variant.sale_price_dzd,
        available_rooms=hotel.available_rooms,
        total_rooms=hotel.total_rooms,
        check_in_date=check_in_date,
        channel=req.source_channel,
        is_returning_customer=is_returning,
        room_count=req.room_count,
    )

    check_out_date = check_in_date + timedelta(days=req.nights)

    # Group discount
    group_discount_pct = 0.0
    is_group = req.room_count >= 5
    if is_group:
        group_discount_pct = 8.0

    booking = Booking(
        booking_ref=generate_booking_ref(),
        hotel_id=req.hotel_id,
        variant_id=req.variant_id,
        customer_id=customer.id,
        check_in=check_in_date,
        check_out=check_out_date,
        nights=req.nights,
        guests_adults=req.guests_adults,
        guests_children=req.guests_children,
        room_count=req.room_count,
        base_price_dzd=variant.base_price_dzd * req.room_count,
        discount_amount_dzd=pricing["discount_amount"],
        final_price_dzd=pricing["total_price"],
        final_price_eur=round(pricing["total_price"] * 0.0067, 2),
        currency="DZD",
        pricing_breakdown=pricing,
        payment_method=req.payment_method,
        payment_status="pending",
        status="pending",
        source_channel=req.source_channel,
        referral_code=req.referral_code,
        special_requests=req.special_requests,
        extras=req.extras,
        is_group_booking=is_group,
        group_discount_pct=group_discount_pct,
        meta_event_id=req.meta_event_id,
        meta_fbp=req.meta_fbp,
        meta_fbc=req.meta_fbc,
    )

    db.add(booking)

    # Update room availability
    hotel.available_rooms = max(0, hotel.available_rooms - req.room_count)
    customer.total_bookings = (customer.total_bookings or 0) + 1

    await db.commit()
    await db.refresh(booking)

    return {
        "success": True,
        "booking": booking.to_dict(),
        "customer_referral_code": customer.referral_code,
        "whatsapp_confirmation_link": f"https://wa.me/213555000001?text=Booking%20{booking.booking_ref}%20confirmed",
    }


@router.get("")
async def list_bookings(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List all bookings (admin)."""
    query = select(Booking)
    if status:
        query = query.where(Booking.status == status)
    query = query.order_by(Booking.created_at.desc())

    count_q = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_q) or 0

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    bookings = result.scalars().all()

    return {
        "bookings": [b.to_dict() for b in bookings],
        "total": total,
        "page": page,
    }


@router.get("/{booking_ref}")
async def get_booking(booking_ref: str, db: AsyncSession = Depends(get_db)):
    """Get booking details by reference."""
    query = select(Booking).where(Booking.booking_ref == booking_ref)
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Get hotel and customer
    hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == booking.hotel_id))).scalar_one_or_none()
    customer = (await db.execute(select(Customer).where(Customer.id == booking.customer_id))).scalar_one_or_none()

    return {
        "booking": booking.to_dict(),
        "hotel": hotel.to_dict() if hotel else None,
        "customer": customer.to_dict() if customer else None,
    }


@router.patch("/{booking_ref}/status")
async def update_booking_status(
    booking_ref: str,
    update: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update booking status."""
    query = select(Booking).where(Booking.booking_ref == booking_ref)
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = update.status
    if update.payment_status:
        booking.payment_status = update.payment_status
    if update.cancellation_reason:
        booking.cancellation_reason = update.cancellation_reason

    # If cancelled, restore room availability
    if update.status == "cancelled":
        hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == booking.hotel_id))).scalar_one_or_none()
        if hotel:
            hotel.available_rooms = min(hotel.total_rooms, hotel.available_rooms + booking.room_count)

    await db.commit()
    return {"success": True, "booking": booking.to_dict()}


@router.get("/stats/summary")
async def booking_stats(db: AsyncSession = Depends(get_db)):
    """Booking statistics for admin dashboard."""
    total = await db.scalar(select(func.count()).select_from(Booking)) or 0
    pending = await db.scalar(
        select(func.count()).select_from(Booking).where(Booking.status == "pending")
    ) or 0
    confirmed = await db.scalar(
        select(func.count()).select_from(Booking).where(Booking.status == "confirmed")
    ) or 0
    total_revenue = await db.scalar(
        select(func.sum(Booking.final_price_dzd)).where(Booking.status.in_(["confirmed", "completed"]))
    ) or 0

    return {
        "total_bookings": total,
        "pending": pending,
        "confirmed": confirmed,
        "total_revenue_dzd": total_revenue,
        "avg_order_value": round(total_revenue / confirmed, 0) if confirmed else 0,
    }
