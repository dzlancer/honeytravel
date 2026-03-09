import {
  TourSearchCriteria, Tour,
  TourCalculationRequest, TourCalculationResponse,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';

export abstract class TourAdapter {
  abstract readonly supplierId: string;

  abstract searchTours(criteria: TourSearchCriteria): Promise<Tour[]>;

  async getTourById(_id: string): Promise<Tour | null> {
    return null;
  }

  abstract calculatePrice(request: TourCalculationRequest): Promise<TourCalculationResponse>;

  abstract createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse>;

  abstract cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }>;

  abstract initialize(credentials: Record<string, string>, config?: Record<string, unknown>): void;
}
