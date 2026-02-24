"""
Seed script: parses real CSV hotel data and creates hotels + variants.
Groups variants (4N, 6N, 7N) by hotel base ID (e.g. HT0001).
Idempotent - drops existing data and re-seeds from CSV.
"""
import asyncio
import csv
import os
import random
import re
from app.database import engine, async_session, Base
from app.models.hotel import Hotel, HotelVariant
from app.models.social_proof import SocialProofEvent

CSV_PATH = os.path.join(os.path.dirname(__file__), "hotels.csv")

DZD_TO_EUR = 0.0067

ALGERIAN_CITIES = [
    "Alger", "Oran", "Constantine", "Annaba", "Setif", "Batna",
    "Blida", "Tlemcen", "Bejaia", "Tizi Ouzou", "Biskra", "Djelfa",
    "Mostaganem", "Chlef", "Skikda", "Jijel", "Bouira", "Ghardaia"
]

ALGERIAN_NAMES = [
    "Karim B.", "Mohamed A.", "Yacine D.", "Amine K.", "Sofiane M.",
    "Nassim R.", "Fatima Z.", "Amira H.", "Sara L.", "Nadia T.",
    "Khadija B.", "Samira F.", "Omar S.", "Bilal N.", "Riad H.",
    "Khaled D.", "Nadir B.", "Anis M.", "Lina K.", "Yasmine A."
]

HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-e87e9d01db6b?w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
]


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text


def extract_hotel_base_name(name: str) -> str:
    """Remove variant suffix like ' - 4 Nuits', ' - 6 Nuits', ' - 7 Nuits'"""
    return re.sub(r'\s*-\s*\d+\s*Nuits?\s*$', '', name, flags=re.IGNORECASE).strip()


def extract_nights(variant_id: str) -> int:
    """Extract nights from variant_id like HT0001_4N -> 4"""
    m = re.search(r'_(\d+)N$', variant_id)
    return int(m.group(1)) if m else 4


def extract_hotel_base_id(variant_id: str) -> str:
    """Extract base hotel ID: HT0001_4N -> HT0001"""
    return re.sub(r'_\d+N$', '', variant_id)


def assign_images(hotel_idx: int) -> list:
    """Assign a rotating set of hotel images"""
    start = hotel_idx % len(HOTEL_IMAGES)
    return [HOTEL_IMAGES[(start + i) % len(HOTEL_IMAGES)] for i in range(5)]


def parse_amenities(description: str, star_rating: int) -> list:
    """Extract amenities from French description text and star rating"""
    amenities = ["wifi", "breakfast"]
    desc_lower = description.lower() if description else ""

    keyword_map = {
        "piscine": "pool", "pool": "pool",
        "spa": "spa", "sauna": "spa",
        "hammam": "hamam",
        "restaurant": "restaurant",
        "fitness": "gym", "sport": "gym", "salle de sport": "gym",
        "parking": "parking",
        "navette": "airport_shuttle", "transfert": "airport_shuttle",
        "concierge": "concierge",
        "bar": "bar", "lounge": "bar",
        "minibar": "minibar",
        "coffre": "safe_box", "safe": "safe_box",
        "terrasse": "rooftop_terrace", "rooftop": "rooftop_terrace",
        "blanchisserie": "laundry",
        "enfant": "kids_club", "famille": "kids_club",
        "room service": "room_service", "service chambre": "room_service",
    }
    for keyword, amenity in keyword_map.items():
        if keyword in desc_lower and amenity not in amenities:
            amenities.append(amenity)

    if "vue" in desc_lower and "mer" in desc_lower and "sea_view" not in amenities:
        amenities.append("sea_view")
    if "vue" in desc_lower and ("ville" in desc_lower or "panoram" in desc_lower) and "city_view" not in amenities:
        amenities.append("city_view")

    if star_rating >= 4:
        for a in ["concierge", "room_service", "safe_box", "minibar"]:
            if a not in amenities:
                amenities.append(a)
    if star_rating >= 5:
        for a in ["spa", "gym", "restaurant", "bar", "airport_shuttle"]:
            if a not in amenities:
                amenities.append(a)

    return list(dict.fromkeys(amenities))


def infer_star_rating(base_price: float, description: str, csv_star: str) -> int:
    """Infer star rating from price, description, and CSV value"""
    desc_lower = description.lower() if description else ""
    if "5 etoiles" in desc_lower or "5-star" in desc_lower:
        return 5
    if "4 etoiles" in desc_lower or "4-star" in desc_lower:
        return 4
    if "2 etoiles" in desc_lower or "2-star" in desc_lower:
        return 2
    try:
        s = int(csv_star)
        if 1 <= s <= 5:
            return s
    except (ValueError, TypeError):
        pass
    if base_price >= 50000:
        return 4
    return 3


async def seed_hotels():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        from sqlalchemy import select, func

        # Always re-seed with CSV data: drop existing data first
        count = await session.scalar(select(func.count()).select_from(Hotel))
        if count and count > 0:
            print(f"Dropping {count} existing hotels to re-seed with CSV data...")
            await session.execute(SocialProofEvent.__table__.delete())
            await session.execute(HotelVariant.__table__.delete())
            await session.execute(Hotel.__table__.delete())
            await session.commit()

        # Parse CSV
        rows = []
        with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

        print(f"Parsed {len(rows)} rows from CSV")

        # Group by hotel base ID
        hotel_groups: dict[str, list] = {}
        for row in rows:
            variant_id = row["hotel_id"].strip()
            base_id = extract_hotel_base_id(variant_id)
            if base_id not in hotel_groups:
                hotel_groups[base_id] = []
            hotel_groups[base_id].append(row)

        print(f"Found {len(hotel_groups)} unique hotels")

        hotels = []
        variants = []
        social_events = []

        for idx, (base_id, group) in enumerate(sorted(hotel_groups.items())):
            # Use the 4N variant (first) for hotel-level data
            first_row = group[0]
            hotel_name = extract_hotel_base_name(first_row["name"].strip())

            # Get neighborhood from 4N variant, skip "Default"
            district = first_row.get("neighborhood[0]", "").strip()
            if not district or district == "Default":
                for r in group:
                    d = r.get("neighborhood[0]", "").strip()
                    if d and d != "Default":
                        district = d
                        break
                if not district or district == "Default":
                    district = "Istanbul Center"

            lat = float(first_row.get("latitude", "41.0082") or "41.0082")
            lng = float(first_row.get("longitude", "28.9784") or "28.9784")
            address = first_row.get("address.addr1", "").strip()

            base_price_4n = float(first_row.get("base_price", "30000") or "30000")
            sale_price_4n = float(first_row.get("sale_price", "28000") or "28000")

            csv_star = first_row.get("star_rating", "3")
            description_fr = first_row.get("description", "").strip()
            star_rating = infer_star_rating(base_price_4n, description_fr, csv_star)

            guest_score = float(first_row.get("guest_rating[0].score", "4.0") or "4.0")
            num_reviews = int(first_row.get("guest_rating[0].number_of_reviewers", "100") or "100")
            phone = first_row.get("phone", "+213549591903").strip()
            email = first_row.get("email", "contact@honeytravelcheraga.com").strip()

            # Collect all variant descriptions to build richer amenity list
            all_descriptions = " ".join(r.get("description", "") for r in group)
            amenities = parse_amenities(all_descriptions, star_rating)

            images = assign_images(idx)
            csv_img1 = first_row.get("image[0].url", "").strip()
            csv_img2 = first_row.get("image[1].url", "").strip()
            if csv_img1:
                images = [csv_img1] + images[:4]
            if csv_img2 and csv_img2 != csv_img1:
                images = images[:1] + [csv_img2] + images[1:4]

            slug = slugify(hotel_name)
            total_rooms = random.randint(20, 120)
            available_rooms = random.randint(2, min(15, total_rooms))

            hotel = Hotel(
                hotel_id=base_id,
                name=hotel_name,
                slug=slug,
                description=f"Discover the best of Istanbul at {hotel_name}, located in {district}. "
                            f"This {star_rating}-star hotel is perfect for Algerian travelers.",
                description_fr=description_fr,
                star_rating=star_rating,
                address=address,
                district=district,
                city="Istanbul",
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                base_price_dzd=int(base_price_4n),
                sale_price_dzd=int(sale_price_4n),
                base_price_eur=round(base_price_4n * DZD_TO_EUR, 2),
                sale_price_eur=round(sale_price_4n * DZD_TO_EUR, 2),
                amenities=amenities,
                images=images,
                meta_data={
                    "source": "META_FEED_CSV",
                    "neighborhood": district,
                    "check_in_time": "14:00",
                    "check_out_time": "12:00",
                    "halal_food": True,
                    "prayer_room": star_rating >= 4,
                    "phone": phone,
                    "email": email,
                    "guest_rating": guest_score,
                    "num_reviews": num_reviews,
                    "booking_url": first_row.get("url", "").strip(),
                    "brand": first_row.get("brand", "Honey Travel Cheraga").strip(),
                },
                total_rooms=total_rooms,
                available_rooms=available_rooms,
                whatsapp_deeplink=f"https://wa.me/213549591903?text=Bonjour%20-%20{slug}",
            )
            hotels.append(hotel)

            # Create variants from CSV rows
            for row in group:
                variant_id = row["hotel_id"].strip()
                nights = extract_nights(variant_id)
                v_base = float(row.get("base_price", "30000") or "30000")
                v_sale = float(row.get("sale_price", "28000") or "28000")
                v_description = row.get("description", "").strip()

                variant = HotelVariant(
                    variant_id=variant_id,
                    hotel_id=base_id,
                    nights=nights,
                    base_price_dzd=int(v_base),
                    sale_price_dzd=int(v_sale),
                    base_price_eur=round(v_base * DZD_TO_EUR, 2),
                    sale_price_eur=round(v_sale * DZD_TO_EUR, 2),
                    includes_breakfast=True,
                    includes_transfer=nights >= 6,
                    max_guests=2 if nights <= 4 else 3,
                    pricing_rules={
                        "demand_multiplier_base": 1.0,
                        "seasonality_summer": 1.2,
                        "seasonality_winter": 0.9,
                        "scarcity_threshold": 5,
                        "scarcity_multiplier": 1.15,
                        "channel_discount_tiktok": 0.05,
                        "loyalty_discount_returning": 0.10,
                        "description_fr": v_description,
                    },
                )
                variants.append(variant)

        # Social proof events
        hotel_ids = [h.hotel_id for h in hotels]
        for _ in range(80):
            event = SocialProofEvent(
                event_type=random.choice(["booking", "view", "search", "wishlist"]),
                hotel_id=random.choice(hotel_ids),
                city=random.choice(ALGERIAN_CITIES),
                guest_name=random.choice(ALGERIAN_NAMES),
                data={
                    "source": random.choice(["web", "whatsapp", "instagram"]),
                    "device": random.choice(["mobile", "desktop"]),
                },
            )
            social_events.append(event)

        session.add_all(hotels)
        session.add_all(variants)
        session.add_all(social_events)
        await session.commit()

        print(f"Seeded {len(hotels)} hotels, {len(variants)} variants, {len(social_events)} social proof events from CSV.")


if __name__ == "__main__":
    asyncio.run(seed_hotels())
