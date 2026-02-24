from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.database import Base


class SocialProofEvent(Base):
    __tablename__ = "social_proof_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False, index=True)  # booking, view, search, wishlist
    hotel_id = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)  # Alger, Oran, Constantine, etc.
    country = Column(String(100), default="Algeria")
    guest_name = Column(String(100), nullable=True)  # anonymized first name
    data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "hotel_id": self.hotel_id,
            "city": self.city,
            "guest_name": self.guest_name,
            "data": self.data or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
