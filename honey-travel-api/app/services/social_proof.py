"""
Social Proof Service - generates realistic social proof data.
In production, this would use Redis counters with TTL.
"""
import random
from datetime import datetime, timedelta

ALGERIAN_CITIES = [
    "Alger", "Oran", "Constantine", "Annaba", "Setif", "Batna",
    "Blida", "Tlemcen", "Bejaia", "Tizi Ouzou", "Biskra", "Djelfa"
]

ALGERIAN_NAMES = [
    "Karim B.", "Mohamed A.", "Yacine D.", "Amine K.", "Sofiane M.",
    "Fatima Z.", "Amira H.", "Sara L.", "Nadia R.", "Khadija B.",
    "Omar S.", "Bilal T.", "Riad F.", "Nassim G.", "Anis P."
]


def get_bookings_today_count() -> int:
    """Simulated Redis counter for today's bookings by Algerians."""
    hour = datetime.utcnow().hour
    base = random.randint(8, 15)
    hourly_boost = min(hour, 12)
    return base + hourly_boost


def get_viewers_count(hotel_id: str) -> dict:
    """People currently viewing this hotel (simulated)."""
    count = random.randint(3, 18)
    city = random.choice(ALGERIAN_CITIES)
    return {"count": count, "city": city}


def get_recent_bookings(limit: int = 5) -> list:
    """Recent bookings for toast notifications."""
    events = []
    for i in range(limit):
        minutes_ago = random.randint(2, 120)
        events.append({
            "guest_name": random.choice(ALGERIAN_NAMES),
            "city": random.choice(ALGERIAN_CITIES),
            "hotel_id": f"HT{random.randint(1, 62):04d}",
            "minutes_ago": minutes_ago,
            "time_text": f"il y a {minutes_ago} min" if minutes_ago < 60 else f"il y a {minutes_ago // 60}h",
        })
    return sorted(events, key=lambda x: x["minutes_ago"])


def get_scarcity_info(available_rooms: int, hotel_name: str) -> dict | None:
    """Scarcity message if rooms are low."""
    if available_rooms <= 3:
        return {
            "level": "critical",
            "message_fr": f"Plus que {available_rooms} chambres a ce prix!",
            "message_ar": f"بقي فقط {available_rooms} غرف بهذا السعر!",
            "message_en": f"Only {available_rooms} rooms left at this price!",
        }
    elif available_rooms <= 8:
        return {
            "level": "warning",
            "message_fr": f"Seulement {available_rooms} chambres disponibles",
            "message_ar": f"فقط {available_rooms} غرف متاحة",
            "message_en": f"Only {available_rooms} rooms available",
        }
    return None
