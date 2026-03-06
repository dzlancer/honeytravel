export interface Hotel {
  id: string;
  supplierId: string;
  supplierHotelId: string;
  name: string;
  description: string;
  starRating: number;
  address: Address;
  location: GeoLocation;
  images: string[];
  amenities: string[];
  rooms: Room[];
  policies: HotelPolicy;
  avgRating: number;
  reviewCount: number;
  minPrice: number;
  currency: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  amenities: string[];
  images: string[];
  pricePerNight: number;
  currency: string;
  available: boolean;
}

export interface HotelPolicy {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  childPolicy?: string;
  petPolicy?: string;
}

export interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[];
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  currency?: string;
}

export interface AvailabilityRequest {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  occupancy: { adults: number; children: number };
}

export interface AvailabilityResponse {
  available: boolean;
  rooms: Room[];
  totalPrice: number;
  currency: string;
}

export interface SupplierBookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: GuestInfo[];
  specialRequests?: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface SupplierBookingResponse {
  success: boolean;
  bookingRef: string;
  confirmationNumber?: string;
  status: string;
}

export interface SupplierConfig {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  isActive: boolean;
  credentials: Record<string, string>;
  rateLimit: number;
  timeout: number;
}

// ─── Flight Types ─────────────────────────────────────────

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  departure: { airport: Airport; dateTime: string };
  arrival: { airport: Airport; dateTime: string };
  /** Shorthand for departure.airport.city */
  origin?: string;
  /** Shorthand for arrival.airport.city */
  destination?: string;
  duration: string;
  cabinClass: string;
}

export interface Flight {
  id: string;
  supplierId: string;
  supplierFlightId: string;
  segments: FlightSegment[];
  stops: number;
  totalDuration: string;
  /** Alias for totalDuration */
  duration?: string;
  price: number;
  /** Per-passenger price (may differ from total price) */
  pricePerPassenger?: number;
  currency: string;
  seatsAvailable: number;
  baggage: { cabin: string; checked: string };
  refundable: boolean;
  images: string[];
}

export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
  directOnly?: boolean;
  sortBy?: 'price' | 'duration' | 'departure';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ─── Activity / Tour Types ────────────────────────────────

export interface Activity {
  id: string;
  supplierId: string;
  supplierActivityId: string;
  name: string;
  description: string;
  category: string;
  destination: { city: string; country: string };
  location: GeoLocation & { city?: string };
  duration: string;
  groupSize: { min: number; max: number };
  difficulty: 'easy' | 'moderate' | 'challenging';
  includes: string[];
  images: string[];
  price: number;
  /** Alias for price, per-person pricing */
  pricePerPerson?: number;
  currency: string;
  avgRating: number;
  reviewCount: number;
  schedule: string[];
  cancellationPolicy: string;
}

export interface ActivitySearchCriteria {
  destination: string;
  date?: string;
  category?: string;
  groupSize?: number;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ─── Car Rental Types ─────────────────────────────────────

export interface CarRental {
  id: string;
  supplierId: string;
  supplierCarId: string;
  name: string;
  category: string;
  make: string;
  model: string;
  year: number;
  transmission: 'automatic' | 'manual';
  fuelType: string;
  seats: number;
  bags: number;
  features: string[];
  pickupLocation: { city: string; address: string };
  dropoffLocation: { city: string; address: string };
  pricePerDay: number;
  /** Alias for pricePerDay */
  price?: number;
  currency: string;
  images: string[];
  mileagePolicy: string;
  insuranceIncluded: boolean;
  avgRating: number;
  reviewCount: number;
}

export interface CarSearchCriteria {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  driverAge?: number;
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
