from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON, Text
)
from sqlalchemy.orm import relationship
from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_ref = Column(String(20), unique=True, nullable=False, index=True)
    hotel_id = Column(String(20), ForeignKey("hotels.hotel_id"), nullable=False)
    variant_id = Column(String(20), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    # Stay details
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    nights = Column(Integer, nullable=False)
    guests_adults = Column(Integer, default=2)
    guests_children = Column(Integer, default=0)
    room_count = Column(Integer, default=1)

    # Pricing
    base_price_dzd = Column(Float, nullable=False)
    discount_amount_dzd = Column(Float, default=0)
    final_price_dzd = Column(Float, nullable=False)
    final_price_eur = Column(Float, nullable=True)
    currency = Column(String(5), default="DZD")
    pricing_breakdown = Column(JSON, default=dict)

    # Payment
    payment_method = Column(String(50), nullable=True)  # cib_d17, baridimob, cash, reserve_pay_hotel
    payment_status = Column(String(20), default="pending")  # pending, partial, paid, refunded
    payment_reference = Column(String(100), nullable=True)

    # Status
    status = Column(String(20), default="pending")  # pending, confirmed, cancelled, completed, no_show
    cancellation_reason = Column(Text, nullable=True)

    # Marketing / tracking
    source_channel = Column(String(50), nullable=True)  # whatsapp, web, tiktok, instagram, facebook
    campaign_id = Column(String(100), nullable=True)
    referral_code = Column(String(20), nullable=True)

    # Meta CAPI fields
    meta_event_id = Column(String(100), nullable=True)
    meta_fbp = Column(String(100), nullable=True)
    meta_fbc = Column(String(100), nullable=True)

    # Extras
    special_requests = Column(Text, nullable=True)
    extras = Column(JSON, default=list)  # transfers, tours, etc.

    is_group_booking = Column(Boolean, default=False)
    group_discount_pct = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_ref": self.booking_ref,
            "hotel_id": self.hotel_id,
            "variant_id": self.variant_id,
            "customer_id": self.customer_id,
            "check_in": self.check_in.isoformat() if self.check_in else None,
            "check_out": self.check_out.isoformat() if self.check_out else None,
            "nights": self.nights,
            "guests_adults": self.guests_adults,
            "guests_children": self.guests_children,
            "room_count": self.room_count,
            "base_price_dzd": self.base_price_dzd,
            "discount_amount_dzd": self.discount_amount_dzd,
            "final_price_dzd": self.final_price_dzd,
            "final_price_eur": self.final_price_eur,
            "currency": self.currency,
            "pricing_breakdown": self.pricing_breakdown or {},
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "status": self.status,
            "source_channel": self.source_channel,
            "special_requests": self.special_requests,
            "extras": self.extras or [],
            "is_group_booking": self.is_group_booking,
            "group_discount_pct": self.group_discount_pct,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
