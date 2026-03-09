export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const ProductType = {
  HOTEL: 'hotel',
  FLIGHT: 'flight',
  ACTIVITY: 'activity',
  PACKAGE: 'package',
  CAR_RENTAL: 'car_rental',
  TOUR: 'tour',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export interface Booking {
  id: string;
  userId: string;
  productType: ProductType;
  productId: string;
  supplierId: string;
  supplierBookingRef?: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount: number;
  currency: string;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  paymentId?: string;
  notes?: string;
  guestDetails: GuestDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface GuestDetail {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
}

export interface CreateBookingDto {
  productType: ProductType;
  productId: string;
  supplierId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestDetails: GuestDetail[];
  totalAmount?: number;
  currency: string;
  loyaltyPointsToUse?: number;
  promoCode?: string;
  tourDate?: string;
  childAges?: number[];
}
