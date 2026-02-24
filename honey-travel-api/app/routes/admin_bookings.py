"""Admin booking operations: status workflow, payment events, WhatsApp logs."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.booking import Booking
from app.models.hotel import Hotel
from app.models.customer import Customer
from app.models.payment_event import PaymentEvent, WhatsAppMessageLog
from app.models.admin import AdminUser, AdminAuditLog
from app.routes.admin_auth import get_current_admin, require_permission

router = APIRouter(prefix="/api/admin/bookings", tags=["admin-bookings"])


class BookingStatusUpdate(BaseModel):
    status: str
    payment_status: Optional[str] = None
    cancellation_reason: Optional[str] = None


class PaymentEventCreate(BaseModel):
    type: str  # invoice_sent, payment_received, refund_issued, reminder_sent
    amount_dzd: Optional[float] = None
    reference: Optional[str] = None
    notes: Optional[str] = None


class WhatsAppLogCreate(BaseModel):
    customer_id: Optional[int] = None
    direction: str = "outbound"
    template_key: Optional[str] = None
    body: Optional[str] = None
    status: str = "sent"


@router.get("")
async def list_bookings_admin(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = 1,
    limit: int = 30,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List bookings with filters."""
    query = select(Booking)
    if status:
        query = query.where(Booking.status == status)
    if payment_status:
        query = query.where(Booking.payment_status == payment_status)
    if search:
        query = query.where(
            Booking.booking_ref.ilike(f"%{search}%")
        )
    if date_from:
        query = query.where(Booking.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.where(Booking.created_at <= datetime.fromisoformat(date_to))

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.order_by(Booking.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    bookings = result.scalars().all()

    booking_list = []
    for b in bookings:
        bd = b.to_dict()
        # Get hotel name
        hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == b.hotel_id))).scalar_one_or_none()
        customer = (await db.execute(select(Customer).where(Customer.id == b.customer_id))).scalar_one_or_none()
        bd["hotel_name"] = hotel.name if hotel else None
        bd["customer_name"] = customer.full_name if customer else None
        bd["customer_phone"] = customer.whatsapp_phone if customer else None
        booking_list.append(bd)

    return {"bookings": booking_list, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/{booking_ref}")
async def get_booking_admin(
    booking_ref: str,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get full booking detail with hotel, customer, payments, messages."""
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == booking.hotel_id))).scalar_one_or_none()
    customer = (await db.execute(select(Customer).where(Customer.id == booking.customer_id))).scalar_one_or_none()

    # Payment events
    pe_result = await db.execute(
        select(PaymentEvent).where(PaymentEvent.booking_id == booking.id).order_by(PaymentEvent.created_at.desc())
    )
    payments = pe_result.scalars().all()

    # WhatsApp logs
    wa_result = await db.execute(
        select(WhatsAppMessageLog).where(WhatsAppMessageLog.booking_id == booking.id).order_by(WhatsAppMessageLog.created_at.desc())
    )
    messages = wa_result.scalars().all()

    return {
        "booking": booking.to_dict(),
        "hotel": hotel.to_dict() if hotel else None,
        "customer": customer.to_dict() if customer else None,
        "payment_events": [p.to_dict() for p in payments],
        "whatsapp_messages": [m.to_dict() for m in messages],
    }


@router.patch("/{booking_ref}/status")
async def update_booking_status(
    booking_ref: str,
    req: BookingStatusUpdate,
    current_user: AdminUser = Depends(require_permission("bookings.write")),
    db: AsyncSession = Depends(get_db),
):
    """Update booking status with audit trail."""
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    old_status = booking.status
    booking.status = req.status
    if req.payment_status:
        booking.payment_status = req.payment_status
    if req.cancellation_reason:
        booking.cancellation_reason = req.cancellation_reason

    # If cancelled, restore rooms
    if req.status == "cancelled" and old_status != "cancelled":
        hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == booking.hotel_id))).scalar_one_or_none()
        if hotel:
            hotel.available_rooms = min(hotel.total_rooms, hotel.available_rooms + booking.room_count)

    log = AdminAuditLog(
        actor_id=current_user.id, actor_email=current_user.email,
        action="update_booking_status", entity_type="booking", entity_id=booking_ref,
        diff={"old_status": old_status, "new_status": req.status},
    )
    db.add(log)
    await db.commit()
    return {"success": True, "booking": booking.to_dict()}


@router.post("/{booking_ref}/payment-events")
async def add_payment_event(
    booking_ref: str,
    req: PaymentEventCreate,
    current_user: AdminUser = Depends(require_permission("bookings.write")),
    db: AsyncSession = Depends(get_db),
):
    """Add a payment event to a booking."""
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    event = PaymentEvent(
        booking_id=booking.id, type=req.type, amount_dzd=req.amount_dzd,
        reference=req.reference, notes=req.notes, created_by_id=current_user.id,
    )
    db.add(event)

    # If payment received, update payment status
    if req.type == "payment_received":
        booking.payment_status = "paid"
        booking.payment_reference = req.reference

    await db.commit()
    await db.refresh(event)
    return {"event": event.to_dict()}


@router.post("/{booking_ref}/whatsapp-log")
async def add_whatsapp_log(
    booking_ref: str,
    req: WhatsAppLogCreate,
    current_user: AdminUser = Depends(require_permission("bookings.write")),
    db: AsyncSession = Depends(get_db),
):
    """Log a WhatsApp message for a booking."""
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    msg = WhatsAppMessageLog(
        booking_id=booking.id, customer_id=req.customer_id or booking.customer_id,
        direction=req.direction, template_key=req.template_key,
        body=req.body, provider="manual", status=req.status,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return {"message": msg.to_dict()}


@router.get("/{booking_ref}/payment-events")
async def list_payment_events(
    booking_ref: str,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    result = await db.execute(
        select(PaymentEvent).where(PaymentEvent.booking_id == booking.id).order_by(PaymentEvent.created_at.desc())
    )
    return {"events": [e.to_dict() for e in result.scalars().all()]}
