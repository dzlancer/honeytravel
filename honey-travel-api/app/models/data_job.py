"""Data import/export job tracking."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
)
from app.database import Base


class DataJob(Base):
    __tablename__ = "data_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)  # hotel_import, hotel_export, booking_export, customer_export
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    requested_by_id = Column(Integer, nullable=True)
    requested_by_email = Column(String(255), nullable=True)
    input_data = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    file_url = Column(String(500), nullable=True)
    error = Column(Text, nullable=True)
    progress_pct = Column(Integer, default=0)
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    error_rows = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status,
            "requested_by_email": self.requested_by_email,
            "result": self.result,
            "file_url": self.file_url,
            "error": self.error,
            "progress_pct": self.progress_pct,
            "total_rows": self.total_rows,
            "processed_rows": self.processed_rows,
            "error_rows": self.error_rows,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
        }
