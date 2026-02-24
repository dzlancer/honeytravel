"""Admin analytics routes: KPIs, funnel, revenue, charts."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, and_
from typing import Optional
from app.database import get_db
from app.models.booking import Booking
from app.models.hotel import Hotel
from app.models.customer import Customer
from app.models.admin import AdminUser
from app.routes.admin_auth import get_current_admin

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])


@router.get("/kpis")
async def get_kpis(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Real-time KPIs: revenue, AOV, conversion, bookings."""
    # Default to last 30 days
    if not date_from:
        date_from_dt = datetime.utcnow() - timedelta(days=30)
    else:
        date_from_dt = datetime.fromisoformat(date_from)

    if not date_to:
        date_to_dt = datetime.utcnow()
    else:
        date_to_dt = datetime.fromisoformat(date_to)

    date_filter = and_(Booking.created_at >= date_from_dt, Booking.created_at <= date_to_dt)

    total_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(date_filter)
    ) or 0

    confirmed_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(
            and_(date_filter, Booking.status.in_(["confirmed", "completed"]))
        )
    ) or 0

    total_revenue = await db.scalar(
        select(func.sum(Booking.final_price_dzd)).where(
            and_(date_filter, Booking.status.in_(["confirmed", "completed"]))
        )
    ) or 0

    avg_order_value = round(total_revenue / confirmed_bookings, 0) if confirmed_bookings else 0
    conversion_rate = round((confirmed_bookings / total_bookings) * 100, 1) if total_bookings else 0

    pending_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(
            and_(date_filter, Booking.status == "pending")
        )
    ) or 0

    cancelled_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(
            and_(date_filter, Booking.status == "cancelled")
        )
    ) or 0

    new_customers = await db.scalar(
        select(func.count()).select_from(Customer).where(
            and_(Customer.created_at >= date_from_dt, Customer.created_at <= date_to_dt)
        )
    ) or 0

    total_customers = await db.scalar(select(func.count()).select_from(Customer)) or 0
    total_hotels = await db.scalar(select(func.count()).select_from(Hotel).where(Hotel.is_active == True)) or 0

    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue_dzd": total_revenue,
        "avg_order_value_dzd": avg_order_value,
        "conversion_rate": conversion_rate,
        "new_customers": new_customers,
        "total_customers": total_customers,
        "total_hotels": total_hotels,
        "date_from": date_from_dt.isoformat(),
        "date_to": date_to_dt.isoformat(),
    }


@router.get("/revenue-by-channel")
async def revenue_by_channel(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Revenue breakdown by source channel."""
    date_from_dt = datetime.fromisoformat(date_from) if date_from else datetime.utcnow() - timedelta(days=30)
    date_to_dt = datetime.fromisoformat(date_to) if date_to else datetime.utcnow()

    date_filter = and_(
        Booking.created_at >= date_from_dt,
        Booking.created_at <= date_to_dt,
        Booking.status.in_(["confirmed", "completed"]),
    )

    result = await db.execute(
        select(
            Booking.source_channel,
            func.count(Booking.id).label("count"),
            func.sum(Booking.final_price_dzd).label("revenue"),
        ).where(date_filter).group_by(Booking.source_channel)
    )

    channels = []
    for row in result.all():
        channels.append({
            "channel": row[0] or "direct",
            "bookings": row[1],
            "revenue": row[2] or 0,
        })

    return {"channels": channels}


@router.get("/revenue-by-day")
async def revenue_by_day(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Daily revenue trend."""
    date_from_dt = datetime.fromisoformat(date_from) if date_from else datetime.utcnow() - timedelta(days=30)
    date_to_dt = datetime.fromisoformat(date_to) if date_to else datetime.utcnow()

    # Get all bookings in range
    result = await db.execute(
        select(Booking).where(
            and_(
                Booking.created_at >= date_from_dt,
                Booking.created_at <= date_to_dt,
            )
        ).order_by(Booking.created_at)
    )
    bookings = result.scalars().all()

    # Group by day
    daily = {}
    for b in bookings:
        day = b.created_at.strftime("%Y-%m-%d") if b.created_at else "unknown"
        if day not in daily:
            daily[day] = {"date": day, "bookings": 0, "revenue": 0, "confirmed": 0}
        daily[day]["bookings"] += 1
        if b.status in ["confirmed", "completed"]:
            daily[day]["revenue"] += b.final_price_dzd or 0
            daily[day]["confirmed"] += 1

    return {"daily": sorted(daily.values(), key=lambda x: x["date"])}


@router.get("/top-hotels")
async def top_hotels(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 10,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Top hotels by bookings and revenue."""
    date_from_dt = datetime.fromisoformat(date_from) if date_from else datetime.utcnow() - timedelta(days=90)
    date_to_dt = datetime.fromisoformat(date_to) if date_to else datetime.utcnow()

    result = await db.execute(
        select(
            Booking.hotel_id,
            func.count(Booking.id).label("count"),
            func.sum(Booking.final_price_dzd).label("revenue"),
        ).where(
            and_(
                Booking.created_at >= date_from_dt,
                Booking.created_at <= date_to_dt,
                Booking.status.in_(["confirmed", "completed"]),
            )
        ).group_by(Booking.hotel_id).order_by(func.sum(Booking.final_price_dzd).desc()).limit(limit)
    )

    top = []
    for row in result.all():
        hotel = (await db.execute(select(Hotel).where(Hotel.hotel_id == row[0]))).scalar_one_or_none()
        top.append({
            "hotel_id": row[0],
            "hotel_name": hotel.name if hotel else "Unknown",
            "bookings": row[1],
            "revenue": row[2] or 0,
        })

    return {"hotels": top}


@router.get("/bookings-by-status")
async def bookings_by_status(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Booking distribution by status."""
    date_from_dt = datetime.fromisoformat(date_from) if date_from else datetime.utcnow() - timedelta(days=30)
    date_to_dt = datetime.fromisoformat(date_to) if date_to else datetime.utcnow()

    result = await db.execute(
        select(
            Booking.status,
            func.count(Booking.id).label("count"),
        ).where(
            and_(Booking.created_at >= date_from_dt, Booking.created_at <= date_to_dt)
        ).group_by(Booking.status)
    )

    statuses = {row[0]: row[1] for row in result.all()}
    return {"statuses": statuses}


@router.get("/payment-methods")
async def payment_methods_stats(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Payment method distribution."""
    date_from_dt = datetime.fromisoformat(date_from) if date_from else datetime.utcnow() - timedelta(days=30)
    date_to_dt = datetime.fromisoformat(date_to) if date_to else datetime.utcnow()

    result = await db.execute(
        select(
            Booking.payment_method,
            func.count(Booking.id).label("count"),
            func.sum(Booking.final_price_dzd).label("revenue"),
        ).where(
            and_(Booking.created_at >= date_from_dt, Booking.created_at <= date_to_dt)
        ).group_by(Booking.payment_method)
    )

    methods = []
    for row in result.all():
        methods.append({
            "method": row[0] or "unknown",
            "count": row[1],
            "revenue": row[2] or 0,
        })

    return {"methods": methods}


@router.get("/district-performance")
async def district_performance(
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Hotel performance by district."""
    result = await db.execute(
        select(
            Hotel.district,
            func.count(Hotel.id).label("hotel_count"),
            func.avg(Hotel.sale_price_dzd).label("avg_price"),
        ).where(Hotel.is_active == True).group_by(Hotel.district)
    )

    districts = []
    for row in result.all():
        # Count bookings for district
        hotel_ids = (await db.execute(
            select(Hotel.hotel_id).where(Hotel.district == row[0])
        )).scalars().all()

        booking_count = 0
        revenue = 0
        if hotel_ids:
            booking_count = await db.scalar(
                select(func.count()).select_from(Booking).where(Booking.hotel_id.in_(hotel_ids))
            ) or 0
            revenue = await db.scalar(
                select(func.sum(Booking.final_price_dzd)).where(
                    Booking.hotel_id.in_(hotel_ids),
                    Booking.status.in_(["confirmed", "completed"]),
                )
            ) or 0

        districts.append({
            "district": row[0],
            "hotel_count": row[1],
            "avg_price": round(row[2] or 0, 0),
            "total_bookings": booking_count,
            "total_revenue": revenue,
        })

    return {"districts": sorted(districts, key=lambda x: x["total_revenue"], reverse=True)}
