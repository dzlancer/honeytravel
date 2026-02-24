"""Ancillary products: excursions, transfers, Istanbul Pass, dinner cruises."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship("Product", back_populates="supplier")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_name": self.contact_name,
            "contact_phone": self.contact_phone,
            "contact_email": self.contact_email,
            "notes": self.notes,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)  # excursion, transfer, pass, cruise, other
    title = Column(String(255), nullable=False)
    title_fr = Column(String(255), nullable=True)
    title_ar = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    description_fr = Column(Text, nullable=True)
    media = Column(JSON, default=list)  # list of image URLs
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier = relationship("Supplier", back_populates="products")
    price_dzd = Column(Float, nullable=False, default=0)
    price_eur = Column(Float, nullable=True)
    duration_hours = Column(Float, nullable=True)
    max_participants = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "title_fr": self.title_fr,
            "title_ar": self.title_ar,
            "description": self.description,
            "description_fr": self.description_fr,
            "media": self.media or [],
            "supplier_id": self.supplier_id,
            "supplier_name": self.supplier.name if self.supplier else None,
            "price_dzd": self.price_dzd,
            "price_eur": self.price_eur,
            "duration_hours": self.duration_hours,
            "max_participants": self.max_participants,
            "is_active": self.is_active,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class BookingProduct(Base):
    __tablename__ = "booking_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price_dzd = Column(Float, nullable=False)
    total_price_dzd = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "product_id": self.product_id,
            "product_title": self.product.title if self.product else None,
            "product_type": self.product.type if self.product else None,
            "quantity": self.quantity,
            "unit_price_dzd": self.unit_price_dzd,
            "total_price_dzd": self.total_price_dzd,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
