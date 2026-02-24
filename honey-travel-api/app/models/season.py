"""Seasons and hotel offers for pricing management."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, JSON
)
from app.database import Base


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    multiplier = Column(Float, default=1.0)  # e.g. 1.2 for peak, 0.9 for low
    color = Column(String(20), default="#3b82f6")  # for calendar display
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "starts_at": self.starts_at.isoformat() if self.starts_at else None,
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "multiplier": self.multiplier,
            "color": self.color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class HotelOffer(Base):
    __tablename__ = "hotel_offers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(String(20), ForeignKey("hotels.hotel_id"), nullable=False)
    title = Column(String(255), nullable=False)
    title_fr = Column(String(255), nullable=True)
    label = Column(String(100), nullable=True)  # badge text
    description = Column(Text, nullable=True)
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    discount_pct = Column(Float, nullable=True)
    discount_amount_dzd = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "hotel_id": self.hotel_id,
            "title": self.title,
            "title_fr": self.title_fr,
            "label": self.label,
            "description": self.description,
            "starts_at": self.starts_at.isoformat() if self.starts_at else None,
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "discount_pct": self.discount_pct,
            "discount_amount_dzd": self.discount_amount_dzd,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
