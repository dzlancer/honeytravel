from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    whatsapp_phone = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    passport_number = Column(String(50), nullable=True)
    nationality = Column(String(100), default="Algerian")
    city = Column(String(100), nullable=True)
    psid = Column(String(100), nullable=True)  # Facebook Page-Scoped ID
    igid = Column(String(100), nullable=True)  # Instagram ID
    preferred_language = Column(String(10), default="fr")
    referral_code = Column(String(20), unique=True, nullable=True)
    referred_by = Column(String(20), nullable=True)
    loyalty_points = Column(Integer, default=0)
    total_bookings = Column(Integer, default=0)
    tags = Column(JSON, default=list)
    notes = Column(String(1000), nullable=True)
    is_vip = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="customer")

    def to_dict(self):
        return {
            "id": self.id,
            "whatsapp_phone": self.whatsapp_phone,
            "full_name": self.full_name,
            "email": self.email,
            "nationality": self.nationality,
            "city": self.city,
            "preferred_language": self.preferred_language,
            "referral_code": self.referral_code,
            "loyalty_points": self.loyalty_points,
            "total_bookings": self.total_bookings,
            "tags": self.tags or [],
            "is_vip": self.is_vip,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
