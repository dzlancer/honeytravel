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
