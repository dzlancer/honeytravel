"""Payment events and WhatsApp message logs."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    type = Column(String(50), nullable=False)  # invoice_sent, payment_received, refund_issued, reminder_sent
    amount_dzd = Column(Float, nullable=True)
    reference = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    payload = Column(JSON, nullable=True)
    created_by_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "type": self.type,
            "amount_dzd": self.amount_dzd,
            "reference": self.reference,
            "notes": self.notes,
            "payload": self.payload,
            "created_by_id": self.created_by_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WhatsAppMessageLog(Base):
    __tablename__ = "whatsapp_message_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, nullable=True)
    customer_id = Column(Integer, nullable=True)
    direction = Column(String(10), nullable=False)  # inbound, outbound
    template_key = Column(String(100), nullable=True)
    body = Column(Text, nullable=True)
    media = Column(JSON, nullable=True)
    provider = Column(String(50), default="twilio")
    provider_msg_id = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)  # sent, delivered, read, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "customer_id": self.customer_id,
            "direction": self.direction,
            "template_key": self.template_key,
            "body": self.body,
            "media": self.media,
            "provider": self.provider,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
