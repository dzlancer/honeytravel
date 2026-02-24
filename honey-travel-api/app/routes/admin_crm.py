"""Admin CRM routes: customer 360, notes, tags, timeline."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.customer import Customer
from app.models.booking import Booking
from app.models.hotel import Hotel
from app.models.customer_timeline import CustomerNote, CustomerTimelineEvent
from app.models.admin import AdminUser, AdminAuditLog
from app.routes.admin_auth import get_current_admin, require_permission

router = APIRouter(prefix="/api/admin/crm", tags=["admin-crm"])


class NoteCreate(BaseModel):
    content: str
    is_pinned: bool = False


class TagUpdate(BaseModel):
    tags: list[str]


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    is_vip: Optional[bool] = None
    preferred_language: Optional[str] = None
    notes: Optional[str] = None


@router.get("/customers")
async def list_customers(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    is_vip: Optional[bool] = None,
    page: int = 1,
    limit: int = 30,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List customers with filters."""
    query = select(Customer)
    if search:
        query = query.where(
            Customer.full_name.ilike(f"%{search}%")
            | Customer.whatsapp_phone.ilike(f"%{search}%")
            | Customer.email.ilike(f"%{search}%")
        )
    if is_vip is not None:
        query = query.where(Customer.is_vip == is_vip)

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.order_by(Customer.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    customers = result.scalars().all()

    customer_list = []
    for c in customers:
        cd = c.to_dict()
        # Total spend
        spend = await db.scalar(
            select(func.sum(Booking.final_price_dzd)).where(
                Booking.customer_id == c.id,
                Booking.status.in_(["confirmed", "completed"])
            )
        ) or 0
        cd["total_spend_dzd"] = spend
        customer_list.append(cd)

    return {"customers": customer_list, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/customers/{customer_id}")
async def get_customer_360(
    customer_id: int,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Customer 360 view: profile, bookings, notes, timeline, spend."""
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Bookings
    bookings_result = await db.execute(
        select(Booking).where(Booking.customer_id == customer_id).order_by(Booking.created_at.desc())
    )
    bookings = bookings_result.scalars().all()

    booking_list = []
    for b in bookings:
        bd = b.to_dict()
        hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == b.hotel_id))).scalar_one_or_none()
        bd["hotel_name"] = hotel.name if hotel else None
        booking_list.append(bd)

    # Notes
    notes_result = await db.execute(
        select(CustomerNote).where(CustomerNote.customer_id == customer_id).order_by(CustomerNote.created_at.desc())
    )
    notes = notes_result.scalars().all()

    # Timeline
    timeline_result = await db.execute(
        select(CustomerTimelineEvent).where(CustomerTimelineEvent.customer_id == customer_id).order_by(CustomerTimelineEvent.created_at.desc()).limit(50)
    )
    timeline = timeline_result.scalars().all()

    # Stats
    total_spend = await db.scalar(
        select(func.sum(Booking.final_price_dzd)).where(
            Booking.customer_id == customer_id,
            Booking.status.in_(["confirmed", "completed"])
        )
    ) or 0

    avg_order = 0
    confirmed_count = await db.scalar(
        select(func.count()).select_from(Booking).where(
            Booking.customer_id == customer_id,
            Booking.status.in_(["confirmed", "completed"])
        )
    ) or 0
    if confirmed_count > 0:
        avg_order = round(total_spend / confirmed_count, 0)

    return {
        "customer": customer.to_dict(),
        "bookings": booking_list,
        "notes": [n.to_dict() for n in notes],
        "timeline": [t.to_dict() for t in timeline],
        "stats": {
            "total_spend_dzd": total_spend,
            "total_bookings": customer.total_bookings or 0,
            "confirmed_bookings": confirmed_count,
            "avg_order_value": avg_order,
            "is_vip": customer.is_vip,
            "loyalty_points": customer.loyalty_points or 0,
        },
    }


@router.patch("/customers/{customer_id}")
async def update_customer(
    customer_id: int,
    req: CustomerUpdate,
    current_user: AdminUser = Depends(require_permission("crm.write")),
    db: AsyncSession = Depends(get_db),
):
    """Update customer profile."""
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)

    log = AdminAuditLog(
        actor_id=current_user.id, actor_email=current_user.email,
        action="update_customer", entity_type="customer", entity_id=str(customer_id),
        diff=update_data,
    )
    db.add(log)
    await db.commit()
    return {"customer": customer.to_dict()}


@router.put("/customers/{customer_id}/tags")
async def update_customer_tags(
    customer_id: int,
    req: TagUpdate,
    current_user: AdminUser = Depends(require_permission("crm.write")),
    db: AsyncSession = Depends(get_db),
):
    """Update customer tags."""
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.tags = req.tags
    await db.commit()

    # Timeline event
    event = CustomerTimelineEvent(
        customer_id=customer_id, event_type="tag_changed",
        title="Tags updated", description=f"Tags set to: {', '.join(req.tags)}",
    )
    db.add(event)
    await db.commit()

    return {"customer": customer.to_dict()}


@router.post("/customers/{customer_id}/notes")
async def add_customer_note(
    customer_id: int,
    req: NoteCreate,
    current_user: AdminUser = Depends(require_permission("crm.write")),
    db: AsyncSession = Depends(get_db),
):
    """Add internal note to customer."""
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    note = CustomerNote(
        customer_id=customer_id,
        author_id=current_user.id,
        author_name=current_user.full_name or current_user.email,
        content=req.content,
        is_pinned=1 if req.is_pinned else 0,
    )
    db.add(note)

    # Timeline event
    event = CustomerTimelineEvent(
        customer_id=customer_id, event_type="note_added",
        title="Note added", description=req.content[:100],
    )
    db.add(event)

    await db.commit()
    await db.refresh(note)
    return {"note": note.to_dict()}


@router.delete("/customers/{customer_id}/notes/{note_id}")
async def delete_customer_note(
    customer_id: int, note_id: int,
    current_user: AdminUser = Depends(require_permission("crm.write")),
    db: AsyncSession = Depends(get_db),
):
    note = (await db.execute(select(CustomerNote).where(CustomerNote.id == note_id))).scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"success": True}


@router.get("/customers/{customer_id}/timeline")
async def get_customer_timeline(
    customer_id: int, page: int = 1, limit: int = 50,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get customer activity timeline."""
    result = await db.execute(
        select(CustomerTimelineEvent).where(CustomerTimelineEvent.customer_id == customer_id)
        .order_by(CustomerTimelineEvent.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return {"events": [e.to_dict() for e in result.scalars().all()]}
