"""
Dynamic Pricing Engine
Calculates price using: base price, demand, seasonality, scarcity, channel discount, loyalty.
"""
from datetime import datetime


def calculate_dynamic_price(
    base_price: float,
    sale_price: float,
    available_rooms: int = 15,
    total_rooms: int = 30,
    view_count: int = 0,
    booking_count: int = 0,
    check_in_date: datetime | None = None,
    channel: str | None = None,
    is_returning_customer: bool = False,
    room_count: int = 1,
) -> dict:
    """Calculate dynamic price with full breakdown."""

    working_price = sale_price if sale_price and sale_price < base_price else base_price
    breakdown = {
        "base_price": base_price,
        "sale_price": sale_price,
        "starting_price": working_price,
    }

    # 1. Demand multiplier (based on views/bookings)
    demand_score = min((view_count * 0.01 + booking_count * 0.05), 0.20)
    demand_multiplier = 1.0 + demand_score
    breakdown["demand_multiplier"] = round(demand_multiplier, 3)

    # 2. Seasonality factor
    seasonality = 1.0
    if check_in_date:
        month = check_in_date.month
        if month in [6, 7, 8]:  # Peak summer
            seasonality = 1.20
        elif month in [12, 1, 2]:  # Winter low
            seasonality = 0.90
        elif month in [4, 5, 9, 10]:  # Shoulder
            seasonality = 1.05
    breakdown["seasonality_factor"] = seasonality

    # 3. Scarcity multiplier
    scarcity = 1.0
    if available_rooms <= 5:
        scarcity = 1.15
    elif available_rooms <= 10:
        scarcity = 1.08
    breakdown["scarcity_multiplier"] = scarcity
    breakdown["available_rooms"] = available_rooms

    # 4. Channel discount
    channel_discount = 0.0
    if channel == "tiktok":
        channel_discount = 0.05
    elif channel == "instagram":
        channel_discount = 0.03
    breakdown["channel_discount"] = channel_discount

    # 5. Loyalty discount
    loyalty_discount = 0.10 if is_returning_customer else 0.0
    breakdown["loyalty_discount"] = loyalty_discount

    # 6. Group discount
    group_discount = 0.0
    if room_count >= 5:
        group_discount = 0.08
    elif room_count >= 3:
        group_discount = 0.04
    breakdown["group_discount"] = group_discount

    # Calculate final
    total_multiplier = demand_multiplier * seasonality * scarcity
    pre_discount_price = working_price * total_multiplier
    total_discount = channel_discount + loyalty_discount + group_discount
    discount_amount = pre_discount_price * total_discount
    final_price = pre_discount_price - discount_amount

    # Per-room pricing
    final_price_per_room = round(final_price, 0)
    total_price = round(final_price_per_room * room_count, 0)

    breakdown["pre_discount_price"] = round(pre_discount_price, 0)
    breakdown["total_discount_pct"] = round(total_discount * 100, 1)
    breakdown["discount_amount"] = round(discount_amount, 0)
    breakdown["final_price_per_room"] = final_price_per_room
    breakdown["total_price"] = total_price
    breakdown["savings"] = round(base_price * room_count - total_price, 0)
    breakdown["savings_pct"] = round((1 - total_price / (base_price * room_count)) * 100, 1) if base_price > 0 else 0

    return breakdown
