"""Customer notes and timeline events for CRM."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, JSON
)
from app.database import Base


class CustomerNote(Base):
    __tablename__ = "customer_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    author_id = Column(Integer, nullable=True)
    author_name = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    is_pinned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "author_id": self.author_id,
            "author_name": self.author_name,
            "content": self.content,
            "is_pinned": bool(self.is_pinned),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CustomerTimelineEvent(Base):
    __tablename__ = "customer_timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # booking_created, payment_received, note_added, tag_changed, whatsapp_sent, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "event_type": self.event_type,
            "title": self.title,
            "description": self.description,
            "meta": self.meta,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
