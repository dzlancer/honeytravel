import {
  CarSearchCriteria, CarRental,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';

export abstract class CarRentalAdapter {
  abstract readonly supplierId: string;

  abstract searchCars(criteria: CarSearchCriteria): Promise<CarRental[]>;

  async getCarById(_id: string): Promise<CarRental | null> {
    return null;
  }

  abstract createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse>;

  abstract cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }>;

  abstract initialize(credentials: Record<string, string>, config?: Record<string, unknown>): void;
}
