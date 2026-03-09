// Generic API wrapper
export interface TSTApiResponse<T> {
  status: boolean;
  data: T;
}

// Tour search item (simplified from full tour)
export interface TSTTourSearchItem {
  id: number;
  tour_name: string;
  slug: string;
  short_description: string;
  destination_city: string;
  destination_country: string;
  tour_style_id: number;
  tour_style_name: string;
  duration_days: number;
  duration_nights: number;
  min_pax: number;
  max_pax: number;
  price: number;
  price_child: number | null;
  currency: string;
  main_image: string;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
}

// Full tour detail
export interface TSTTourDetail {
  id: number;
  tour_name: string;
  slug: string;
  description: string;
  short_description: string;
  highlights: string;
  destination_city: string;
  destination_country: string;
  tour_style_id: number;
  tour_style_name: string;
  duration_days: number;
  duration_nights: number;
  difficulty: string;
  min_pax: number;
  max_pax: number;
  price: number;
  price_child: number | null;
  currency: string;
  main_image: string;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  guide_languages: string | null;
}

// Gallery
export interface TSTGalleryItem {
  id: number;
  tour_id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

// Itinerary
export interface TSTItineraryDay {
  id: number;
  tour_id: number;
  day_number: number;
  title: string;
  description: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  accommodation_name: string | null;
  locations: string | null;
}

// Facility include/exclude
export interface TSTFacility {
  id: number;
  tour_id: number;
  name: string;
  description: string | null;
}

// Available date
export interface TSTAvailableDate {
  id: number;
  tour_id: number;
  date: string;
  available_slots: number;
}

// Cancellation policy
export interface TSTCancellationPolicy {
  id: number;
  tour_id: number;
  description: string;
  days_before: number;
  penalty_percentage: number;
}

// Child policy
export interface TSTChildPolicy {
  id: number;
  tour_id: number;
  description: string;
  min_age: number;
  max_age: number;
  discount_percentage: number;
}

// Price calculation
export interface TSTCalculationResult {
  tour_id: number;
  date: string;
  available: boolean;
  adults: number;
  children: number;
  price_per_adult: number;
  price_per_child: number;
  total_price: number;
  currency: string;
  supplements: { name: string; price: number }[];
}

// Booking
export interface TSTBookingRequest {
  tour_id: number;
  date: string;
  adults: { first_name: string; last_name: string; email: string; phone?: string; passport_number?: string; date_of_birth?: string; nationality?: string }[];
  children?: { first_name: string; last_name: string; age: number; passport_number?: string; date_of_birth?: string }[];
  special_requests?: string;
}

export interface TSTBookingResponse {
  booking_id: number;
  booking_reference: string;
  confirmation_number: string;
  status: string;
  total_price: number;
  currency: string;
}

// Tour styles
export interface TSTTourStyle {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}
