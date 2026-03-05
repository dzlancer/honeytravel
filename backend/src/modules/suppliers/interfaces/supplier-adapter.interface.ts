import {
  SearchCriteria, AvailabilityRequest, AvailabilityResponse,
  SupplierBookingRequest, SupplierBookingResponse, Hotel,
} from '../../../../../shared/types/supplier';

export abstract class SupplierAdapter {
  abstract readonly supplierId: string;

  abstract searchHotels(criteria: SearchCriteria): Promise<Hotel[]>;

  abstract checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse>;

  abstract createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse>;

  abstract cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }>;

  abstract initialize(credentials: Record<string, string>, config?: Record<string, unknown>): void;
}
