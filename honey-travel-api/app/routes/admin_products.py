"""Admin products routes: excursions, transfers, passes, bundling."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.product import Product, Supplier, BookingProduct
from app.models.booking import Booking
from app.models.admin import AdminUser, AdminAuditLog
from app.routes.admin_auth import get_current_admin, require_permission

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])


class ProductCreate(BaseModel):
    type: str  # excursion, transfer, pass, cruise, other
    title: str
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    description: Optional[str] = None
    description_fr: Optional[str] = None
    media: list = []
    supplier_id: Optional[int] = None
    price_dzd: float = 0
    price_eur: Optional[float] = None
    duration_hours: Optional[float] = None
    max_participants: Optional[int] = None
    is_active: bool = True
    sort_order: int = 0


class ProductUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    description: Optional[str] = None
    description_fr: Optional[str] = None
    media: Optional[list] = None
    supplier_id: Optional[int] = None
    price_dzd: Optional[float] = None
    price_eur: Optional[float] = None
    duration_hours: Optional[float] = None
    max_participants: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class SupplierCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class BookingProductAdd(BaseModel):
    product_id: int
    quantity: int = 1


# --- Products CRUD ---

@router.get("")
async def list_products(
    type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all products."""
    query = select(Product)
    if type:
        query = query.where(Product.type == type)
    if is_active is not None:
        query = query.where(Product.is_active == is_active)
    query = query.order_by(Product.sort_order, Product.title)
    result = await db.execute(query)
    return {"products": [p.to_dict() for p in result.scalars().all()]}


@router.get("/{product_id}")
async def get_product(
    product_id: int,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"product": product.to_dict()}


@router.post("")
async def create_product(
    req: ProductCreate,
    current_user: AdminUser = Depends(require_permission("products.write")),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        type=req.type, title=req.title, title_fr=req.title_fr, title_ar=req.title_ar,
        description=req.description, description_fr=req.description_fr,
        media=req.media, supplier_id=req.supplier_id,
        price_dzd=req.price_dzd, price_eur=req.price_eur or round(req.price_dzd * 0.0067, 2),
        duration_hours=req.duration_hours, max_participants=req.max_participants,
        is_active=req.is_active, sort_order=req.sort_order,
    )
    db.add(product)

    log = AdminAuditLog(actor_id=current_user.id, actor_email=current_user.email, action="create_product", entity_type="product", diff={"title": req.title, "type": req.type})
    db.add(log)

    await db.commit()
    await db.refresh(product)
    return {"product": product.to_dict()}


@router.patch("/{product_id}")
async def update_product(
    product_id: int,
    req: ProductUpdate,
    current_user: AdminUser = Depends(require_permission("products.write")),
    db: AsyncSession = Depends(get_db),
):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    if "price_dzd" in update_data and "price_eur" not in update_data:
        product.price_eur = round(product.price_dzd * 0.0067, 2)

    await db.commit()
    return {"product": product.to_dict()}


@router.delete("/{product_id}")
async def deactivate_product(
    product_id: int,
    current_user: AdminUser = Depends(require_permission("products.write")),
    db: AsyncSession = Depends(get_db),
):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    await db.commit()
    return {"success": True}


# --- Suppliers ---

@router.get("/suppliers/all")
async def list_suppliers(
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Supplier).order_by(Supplier.name))
    return {"suppliers": [s.to_dict() for s in result.scalars().all()]}


@router.post("/suppliers")
async def create_supplier(
    req: SupplierCreate,
    current_user: AdminUser = Depends(require_permission("products.write")),
    db: AsyncSession = Depends(get_db),
):
    supplier = Supplier(
        name=req.name, contact_name=req.contact_name,
        contact_phone=req.contact_phone, contact_email=req.contact_email,
        notes=req.notes, is_active=req.is_active,
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return {"supplier": supplier.to_dict()}


# --- Booking Products (bundling) ---

@router.post("/booking/{booking_ref}/add-product")
async def add_product_to_booking(
    booking_ref: str,
    req: BookingProductAdd,
    current_user: AdminUser = Depends(require_permission("bookings.write")),
    db: AsyncSession = Depends(get_db),
):
    """Add an ancillary product to a booking."""
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    product = (await db.execute(select(Product).where(Product.id == req.product_id))).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    bp = BookingProduct(
        booking_id=booking.id, product_id=req.product_id,
        quantity=req.quantity, unit_price_dzd=product.price_dzd,
        total_price_dzd=product.price_dzd * req.quantity,
    )
    db.add(bp)
    await db.commit()
    await db.refresh(bp)
    return {"booking_product": bp.to_dict()}


@router.get("/booking/{booking_ref}/products")
async def list_booking_products(
    booking_ref: str,
    current_user: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    booking = (await db.execute(select(Booking).where(Booking.booking_ref == booking_ref))).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    result = await db.execute(select(BookingProduct).where(BookingProduct.booking_id == booking.id))
    return {"products": [bp.to_dict() for bp in result.scalars().all()]}
