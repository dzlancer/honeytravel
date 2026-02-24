import json
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(String(20), unique=True, nullable=False, index=True)  # e.g. HT0001
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    description_fr = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    star_rating = Column(Integer, default=3)
    address = Column(String(500), nullable=True)
    district = Column(String(100), nullable=True, index=True)
    city = Column(String(100), default="Istanbul")
    country = Column(String(100), default="Turkey")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    base_price_dzd = Column(Float, nullable=False, default=0)
    sale_price_dzd = Column(Float, nullable=True)
    base_price_eur = Column(Float, nullable=True)
    sale_price_eur = Column(Float, nullable=True)
    amenities = Column(JSON, default=list)
    images = Column(JSON, default=list)
    meta_data = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    total_rooms = Column(Integer, default=20)
    available_rooms = Column(Integer, default=15)
    whatsapp_deeplink = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    variants = relationship("HotelVariant", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel")

    def to_dict(self):
        return {
            "id": self.id,
            "hotel_id": self.hotel_id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "description_fr": self.description_fr,
            "star_rating": self.star_rating,
            "address": self.address,
            "district": self.district,
            "city": self.city,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "base_price_dzd": self.base_price_dzd,
            "sale_price_dzd": self.sale_price_dzd,
            "base_price_eur": self.base_price_eur,
            "sale_price_eur": self.sale_price_eur,
            "amenities": self.amenities or [],
            "images": self.images or [],
            "meta_data": self.meta_data or {},
            "is_active": self.is_active,
            "total_rooms": self.total_rooms,
            "available_rooms": self.available_rooms,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HotelVariant(Base):
    __tablename__ = "hotel_variants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    variant_id = Column(String(20), unique=True, nullable=False, index=True)  # e.g. HT0001_4N
    hotel_id = Column(String(20), ForeignKey("hotels.hotel_id"), nullable=False)
    nights = Column(Integer, nullable=False)  # 4, 6, or 7
    base_price_dzd = Column(Float, nullable=False)
    sale_price_dzd = Column(Float, nullable=True)
    base_price_eur = Column(Float, nullable=True)
    sale_price_eur = Column(Float, nullable=True)
    includes_breakfast = Column(Boolean, default=True)
    includes_transfer = Column(Boolean, default=False)
    max_guests = Column(Integer, default=2)
    is_active = Column(Boolean, default=True)
    pricing_rules = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="variants")

    def to_dict(self):
        return {
            "id": self.id,
            "variant_id": self.variant_id,
            "hotel_id": self.hotel_id,
            "nights": self.nights,
            "base_price_dzd": self.base_price_dzd,
            "sale_price_dzd": self.sale_price_dzd,
            "base_price_eur": self.base_price_eur,
            "sale_price_eur": self.sale_price_eur,
            "includes_breakfast": self.includes_breakfast,
            "includes_transfer": self.includes_transfer,
            "max_guests": self.max_guests,
            "is_active": self.is_active,
            "pricing_rules": self.pricing_rules or {},
        }
