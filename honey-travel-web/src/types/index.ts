export interface Hotel {
  id: number;
  hotel_id: string;
  name: string;
  slug: string;
  description: string;
  description_fr: string;
  star_rating: number;
  address: string;
  district: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  base_price_dzd: number;
  sale_price_dzd: number;
  base_price_eur: number;
  sale_price_eur: number;
  amenities: string[];
  images: string[];
  meta_data: Record<string, unknown>;
  is_active: boolean;
  total_rooms: number;
  available_rooms: number;
  created_at: string;
  variants?: HotelVariant[];
  social_proof?: SocialProof;
}

export interface HotelVariant {
  id: number;
  variant_id: string;
  hotel_id: string;
  nights: number;
  base_price_dzd: number;
  sale_price_dzd: number;
  base_price_eur: number;
  sale_price_eur: number;
  includes_breakfast: boolean;
  includes_transfer: boolean;
  max_guests: number;
  is_active: boolean;
  pricing_rules: Record<string, number>;
  dynamic_pricing?: PricingBreakdown;
}

export interface PricingBreakdown {
  base_price: number;
  sale_price: number;
  starting_price: number;
  demand_multiplier: number;
  seasonality_factor: number;
  scarcity_multiplier: number;
  channel_discount: number;
  loyalty_discount: number;
  group_discount: number;
  pre_discount_price: number;
  total_discount_pct: number;
  discount_amount: number;
  final_price_per_room: number;
  total_price: number;
  savings: number;
  savings_pct: number;
  available_rooms: number;
}

export interface SocialProof {
  viewers: { count: number; city: string };
  scarcity: { level: string; message_fr: string; message_ar: string; message_en: string } | null;
  bookings_today: number;
}

export interface Booking {
  id: number;
  booking_ref: string;
  hotel_id: string;
  variant_id: string;
  customer_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  guests_adults: number;
  guests_children: number;
  room_count: number;
  base_price_dzd: number;
  discount_amount_dzd: number;
  final_price_dzd: number;
  final_price_eur: number;
  currency: string;
  pricing_breakdown: PricingBreakdown;
  payment_method: string;
  payment_status: string;
  status: string;
  source_channel: string;
  special_requests: string;
  extras: string[];
  is_group_booking: boolean;
  group_discount_pct: number;
  created_at: string;
}

export interface Customer {
  id: number;
  whatsapp_phone: string;
  full_name: string;
  email: string;
  nationality: string;
  city: string;
  preferred_language: string;
  referral_code: string;
  loyalty_points: number;
  total_bookings: number;
  tags: string[];
  is_vip: boolean;
  created_at: string;
}

export interface District {
  name: string;
  count: number;
}

export interface RecentBooking {
  guest_name: string;
  city: string;
  hotel_id: string;
  minutes_ago: number;
  time_text: string;
}

export interface BookingFormData {
  hotel_id: string;
  variant_id: string;
  check_in: string;
  nights: number;
  guests_adults: number;
  guests_children: number;
  room_count: number;
  full_name: string;
  whatsapp_phone: string;
  email: string;
  passport_number: string;
  city: string;
  payment_method: string;
  source_channel: string;
  referral_code: string;
  special_requests: string;
  extras: string[];
}
