"""Admin import/export routes: CSV import with validation, export to CSV/XLSX."""
import csv
import io
import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.hotel import Hotel, HotelVariant
from app.models.booking import Booking
from app.models.customer import Customer
from app.models.data_job import DataJob
from app.models.admin import AdminUser, AdminAuditLog
from app.routes.admin_auth import get_current_admin, require_permission

router = APIRouter(prefix="/api/admin/import-export", tags=["admin-import-export"])


def slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text


# --- CSV Import ---

@router.post("/hotels/preview-import")
async def preview_hotel_import(
    file: UploadFile = File(...),
    current_user: AdminUser = Depends(require_permission("import_export.write")),
    db: AsyncSession = Depends(get_db),
):
    """Preview CSV import: validate and show what will change."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    text = content.decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(text))

    preview_rows = []
    errors = []
    row_num = 0

    for row in reader:
        row_num += 1
        row_errors = []

        # Validate required fields
        name = (row.get('title') or row.get('name') or '').strip()
        if not name:
            row_errors.append("Missing hotel name/title")

        price_str = (row.get('price') or row.get('sale_price') or row.get('base_price') or '0').strip()
        try:
            price = float(price_str.replace(',', '').replace(' DZD', '').replace(' ', ''))
        except ValueError:
            price = 0
            row_errors.append(f"Invalid price: {price_str}")

        hotel_id = (row.get('id') or row.get('hotel_id') or f"HT{row_num:04d}").strip()

        # Check if exists
        existing = (await db.execute(select(Hotel).where(Hotel.hotel_id == hotel_id))).scalar_one_or_none()

        preview_rows.append({
            "row": row_num,
            "hotel_id": hotel_id,
            "name": name,
            "price_dzd": price,
            "district": (row.get('neighborhood[0]') or row.get('district') or '').strip(),
            "star_rating": int(row.get('star_rating') or row.get('stars') or 3),
            "action": "update" if existing else "create",
            "errors": row_errors,
        })

        if row_errors:
            errors.extend([f"Row {row_num}: {e}" for e in row_errors])

    return {
        "total_rows": row_num,
        "valid_rows": sum(1 for r in preview_rows if not r["errors"]),
        "error_rows": sum(1 for r in preview_rows if r["errors"]),
        "creates": sum(1 for r in preview_rows if r["action"] == "create" and not r["errors"]),
        "updates": sum(1 for r in preview_rows if r["action"] == "update" and not r["errors"]),
        "preview": preview_rows[:50],
        "errors": errors[:50],
    }


@router.post("/hotels/import")
async def import_hotels(
    file: UploadFile = File(...),
    current_user: AdminUser = Depends(require_permission("import_export.write")),
    db: AsyncSession = Depends(get_db),
):
    """Import hotels from CSV with validation."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    text = content.decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(text))

    # Create job record
    job = DataJob(
        type="hotel_import", status="processing",
        requested_by_id=current_user.id, requested_by_email=current_user.email,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    await db.flush()

    created = 0
    updated = 0
    errors = []
    row_num = 0

    for row in reader:
        row_num += 1
        try:
            name = (row.get('title') or row.get('name') or '').strip()
            if not name:
                errors.append({"row": row_num, "error": "Missing name"})
                continue

            hotel_id = (row.get('id') or row.get('hotel_id') or f"HT{row_num:04d}").strip()
            price_str = (row.get('price') or row.get('sale_price') or row.get('base_price') or '0').strip()
            try:
                price = float(price_str.replace(',', '').replace(' DZD', '').replace(' ', ''))
            except ValueError:
                price = 0

            description = (row.get('description') or '').strip()
            address = (row.get('address.addr1') or row.get('address') or '').strip()
            district = (row.get('neighborhood[0]') or row.get('district') or '').strip()
            star_rating = int(row.get('star_rating') or row.get('stars') or 3)

            lat_str = (row.get('latitude') or '0').strip()
            lng_str = (row.get('longitude') or '0').strip()
            try:
                latitude = float(lat_str) if lat_str else 0
                longitude = float(lng_str) if lng_str else 0
            except ValueError:
                latitude = 0
                longitude = 0

            # Image
            image_url = (row.get('image[0].url') or row.get('image_url') or '').strip()
            images = [image_url] if image_url else []

            slug = slugify(name)

            existing = (await db.execute(select(Hotel).where(Hotel.hotel_id == hotel_id))).scalar_one_or_none()

            if existing:
                existing.name = name
                existing.description_fr = description or existing.description_fr
                existing.address = address or existing.address
                existing.district = district or existing.district
                existing.star_rating = star_rating
                existing.latitude = latitude or existing.latitude
                existing.longitude = longitude or existing.longitude
                if price > 0:
                    existing.base_price_dzd = price
                    existing.sale_price_dzd = price
                    existing.base_price_eur = round(price * 0.0067, 2)
                    existing.sale_price_eur = round(price * 0.0067, 2)
                if images:
                    existing.images = images
                updated += 1
            else:
                hotel = Hotel(
                    hotel_id=hotel_id, name=name, slug=slug,
                    description=description, description_fr=description,
                    star_rating=star_rating, address=address, district=district,
                    latitude=latitude, longitude=longitude,
                    base_price_dzd=price, sale_price_dzd=price,
                    base_price_eur=round(price * 0.0067, 2),
                    sale_price_eur=round(price * 0.0067, 2),
                    images=images, is_active=True,
                )
                db.add(hotel)
                await db.flush()

                # Create default variants (4N, 6N, 7N)
                for nights, mult in [(4, 1.0), (6, 1.4), (7, 1.6)]:
                    v_price = round(price * mult, 0)
                    variant = HotelVariant(
                        variant_id=f"{hotel_id}_{nights}N",
                        hotel_id=hotel_id, nights=nights,
                        base_price_dzd=v_price, sale_price_dzd=v_price,
                        base_price_eur=round(v_price * 0.0067, 2),
                        sale_price_eur=round(v_price * 0.0067, 2),
                        includes_breakfast=True,
                    )
                    db.add(variant)
                created += 1

        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})

    # Update job
    job.status = "completed"
    job.finished_at = datetime.utcnow()
    job.total_rows = row_num
    job.processed_rows = created + updated
    job.error_rows = len(errors)
    job.progress_pct = 100
    job.result = {"created": created, "updated": updated, "errors_count": len(errors)}

    log = AdminAuditLog(
        actor_id=current_user.id, actor_email=current_user.email,
        action="import_hotels", entity_type="hotel",
        diff={"total": row_num, "created": created, "updated": updated, "errors": len(errors)},
    )
    db.add(log)

    await db.commit()

    return {
        "success": True,
        "job_id": job.id,
        "total_rows": row_num,
        "created": created,
        "updated": updated,
        "errors": errors[:50],
    }


# --- Exports ---

@router.get("/hotels/export")
async def export_hotels(
    format: str = "csv",
    current_user: AdminUser = Depends(require_permission("import_export.read")),
    db: AsyncSession = Depends(get_db),
):
    """Export all hotels to CSV or XLSX."""
    result = await db.execute(select(Hotel).order_by(Hotel.hotel_id))
    hotels = result.scalars().all()

    if format == "xlsx":
        return await _export_hotels_xlsx(hotels, current_user, db)

    # CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "hotel_id", "name", "slug", "star_rating", "district", "address",
        "base_price_dzd", "sale_price_dzd", "latitude", "longitude",
        "total_rooms", "available_rooms", "is_active"
    ])
    for h in hotels:
        writer.writerow([
            h.hotel_id, h.name, h.slug, h.star_rating, h.district, h.address,
            h.base_price_dzd, h.sale_price_dzd, h.latitude, h.longitude,
            h.total_rooms, h.available_rooms, h.is_active,
        ])

    output.seek(0)

    log = AdminAuditLog(
        actor_id=current_user.id, actor_email=current_user.email,
        action="export_hotels", entity_type="hotel", diff={"format": format, "count": len(hotels)},
    )
    db.add(log)
    await db.commit()

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=hotels_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"},
    )


async def _export_hotels_xlsx(hotels, current_user, db):
    """Export hotels to XLSX format."""
    try:
        from openpyxl import Workbook
    except ImportError:
        raise HTTPException(status_code=500, detail="openpyxl not installed")

    wb = Workbook()
    ws = wb.active
    ws.title = "Hotels"
    ws.append([
        "hotel_id", "name", "slug", "star_rating", "district", "address",
        "base_price_dzd", "sale_price_dzd", "latitude", "longitude",
        "total_rooms", "available_rooms", "is_active"
    ])
    for h in hotels:
        ws.append([
            h.hotel_id, h.name, h.slug, h.star_rating, h.district, h.address,
            h.base_price_dzd, h.sale_price_dzd, h.latitude, h.longitude,
            h.total_rooms, h.available_rooms, h.is_active,
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=hotels_export_{datetime.utcnow().strftime('%Y%m%d')}.xlsx"},
    )


@router.get("/bookings/export")
async def export_bookings(
    format: str = "csv",
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: AdminUser = Depends(require_permission("import_export.read")),
    db: AsyncSession = Depends(get_db),
):
    """Export bookings to CSV."""
    query = select(Booking)
    if status:
        query = query.where(Booking.status == status)
    if date_from:
        query = query.where(Booking.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.where(Booking.created_at <= datetime.fromisoformat(date_to))
    query = query.order_by(Booking.created_at.desc())

    result = await db.execute(query)
    bookings = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "booking_ref", "hotel_id", "variant_id", "customer_id",
        "check_in", "check_out", "nights", "guests_adults", "guests_children",
        "room_count", "final_price_dzd", "payment_method", "payment_status",
        "status", "source_channel", "created_at"
    ])
    for b in bookings:
        writer.writerow([
            b.booking_ref, b.hotel_id, b.variant_id, b.customer_id,
            b.check_in.isoformat() if b.check_in else "", b.check_out.isoformat() if b.check_out else "",
            b.nights, b.guests_adults, b.guests_children,
            b.room_count, b.final_price_dzd, b.payment_method, b.payment_status,
            b.status, b.source_channel, b.created_at.isoformat() if b.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=bookings_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"},
    )


@router.get("/customers/export")
async def export_customers(
    format: str = "csv",
    current_user: AdminUser = Depends(require_permission("import_export.read")),
    db: AsyncSession = Depends(get_db),
):
    """Export customers to CSV."""
    result = await db.execute(select(Customer).order_by(Customer.created_at.desc()))
    customers = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "whatsapp_phone", "full_name", "email", "city",
        "nationality", "total_bookings", "loyalty_points", "is_vip",
        "preferred_language", "created_at"
    ])
    for c in customers:
        writer.writerow([
            c.id, c.whatsapp_phone, c.full_name, c.email, c.city,
            c.nationality, c.total_bookings, c.loyalty_points, c.is_vip,
            c.preferred_language, c.created_at.isoformat() if c.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=customers_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"},
    )


# --- Templates ---

@router.get("/templates/hotels")
async def download_hotel_template():
    """Download CSV template for hotel import."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "description", "price", "address.addr1", "latitude", "longitude", "star_rating", "neighborhood[0]", "image[0].url"])
    writer.writerow(["HT0001", "Example Hotel", "A nice hotel in Istanbul", "35000", "123 Main St, Laleli", "41.0082", "28.9784", "4", "Laleli", "https://example.com/image.jpg"])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hotel_import_template.csv"},
    )


# --- Jobs ---

@router.get("/jobs")
async def list_jobs(
    page: int = 1, limit: int = 20,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List import/export jobs."""
    total = await db.scalar(select(func.count()).select_from(DataJob)) or 0
    result = await db.execute(
        select(DataJob).order_by(DataJob.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return {"jobs": [j.to_dict() for j in result.scalars().all()], "total": total, "page": page}
