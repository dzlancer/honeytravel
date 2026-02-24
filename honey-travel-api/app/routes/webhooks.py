"""Webhook routes for payment callbacks and WhatsApp."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.booking import Booking

router = APIRouter(prefix="/api", tags=["webhooks"])


class D17Confirmation(BaseModel):
    transaction_id: str
    booking_ref: str
    amount: float
    currency: str = "DZD"
    status: str  # success, failed, pending
    payment_method: str = "cib_d17"


class WhatsAppMessage(BaseModel):
    from_number: str
    message_body: str
    message_type: str = "text"  # text, image, location, button
    timestamp: Optional[str] = None
    profile_name: Optional[str] = None


@router.post("/webhooks/d17/confirmation")
async def d17_payment_callback(payload: D17Confirmation, db: AsyncSession = Depends(get_db)):
    """Handle D17/CIB payment confirmation callback."""
    query = select(Booking).where(Booking.booking_ref == payload.booking_ref)
    result = await db.execute(query)
    booking = result.scalar_one_or_none()

    if not booking:
        return {"success": False, "error": "Booking not found"}

    if payload.status == "success":
        booking.payment_status = "paid"
        booking.payment_reference = payload.transaction_id
        booking.status = "confirmed"
    elif payload.status == "failed":
        booking.payment_status = "failed"

    await db.commit()

    return {
        "success": True,
        "booking_ref": booking.booking_ref,
        "status": booking.status,
        "payment_status": booking.payment_status,
    }


@router.post("/whatsapp/webhook")
async def whatsapp_webhook(msg: WhatsAppMessage):
    """Handle incoming WhatsApp messages.
    In production, integrate with Twilio/360dialog Business API.
    """
    response_text = ""
    body = msg.message_body.strip().lower()

    if body in ["1", "best price", "meilleur prix"]:
        response_text = (
            "Merci pour votre interet! Voici nos meilleures offres Istanbul:\n\n"
            "Hotel 3* a partir de 28,000 DZD/nuit\n"
            "Hotel 4* a partir de 48,000 DZD/nuit\n"
            "Hotel 5* a partir de 85,000 DZD/nuit\n\n"
            "Repondez avec le nom du quartier:\n"
            "- Laleli\n- Fatih\n- Sultanahmet\n- Taksim"
        )
    elif body in ["2", "browse", "parcourir"]:
        response_text = (
            "Nos quartiers populaires a Istanbul:\n\n"
            "1. Laleli - Shopping & Budget\n"
            "2. Fatih - Culture & Histoire\n"
            "3. Sultanahmet - Tourisme Premium\n"
            "4. Taksim - Vie Nocturne & Moderne\n\n"
            "Tapez le numero du quartier pour voir les hotels."
        )
    elif body in ["3", "bookings", "reservations"]:
        response_text = (
            "Pour consulter vos reservations, veuillez fournir:\n"
            "- Votre reference de reservation (ex: HNY-XXXXXX)\n"
            "- Ou votre numero WhatsApp"
        )
    elif body in ["4", "help", "aide", "urgence"]:
        response_text = (
            "Support d'urgence Honey Travel:\n"
            "Tel: +213 555 000 001\n"
            "Email: support@honeytravel.dz\n"
            "Bureau: Cheraga, Alger\n\n"
            "Heures: 8h-22h (heure d'Alger)"
        )
    else:
        response_text = (
            "Bienvenue chez Honey Travel Istanbul!\n\n"
            "Choisissez une option:\n"
            "1. Obtenir le meilleur prix\n"
            "2. Parcourir les hotels\n"
            "3. Mes reservations\n"
            "4. Support d'urgence\n\n"
            "Ou visitez notre site: honeytravel.dz"
        )

    return {
        "success": True,
        "response": {
            "to": msg.from_number,
            "type": "text",
            "text": response_text,
        },
    }


@router.get("/b2b/availability")
async def b2b_availability(
    hotel_id: Optional[str] = None,
    district: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """B2B partner endpoint with net rates (commission included)."""
    from app.models.hotel import Hotel, HotelVariant

    query = select(Hotel).where(Hotel.is_active == True)
    if hotel_id:
        query = query.where(Hotel.hotel_id == hotel_id)
    if district:
        query = query.where(Hotel.district == district)

    result = await db.execute(query)
    hotels = result.scalars().all()

    b2b_data = []
    for hotel in hotels:
        v_query = select(HotelVariant).where(HotelVariant.hotel_id == hotel.hotel_id)
        v_result = await db.execute(v_query)
        variants = v_result.scalars().all()

        b2b_data.append({
            "hotel_id": hotel.hotel_id,
            "name": hotel.name,
            "district": hotel.district,
            "star_rating": hotel.star_rating,
            "available_rooms": hotel.available_rooms,
            "variants": [
                {
                    "variant_id": v.variant_id,
                    "nights": v.nights,
                    "net_rate_dzd": round(v.sale_price_dzd * 0.85, 0),  # 15% commission
                    "rack_rate_dzd": v.base_price_dzd,
                    "commission_pct": 15,
                }
                for v in variants
            ],
        })

    return {"hotels": b2b_data, "total": len(b2b_data)}
