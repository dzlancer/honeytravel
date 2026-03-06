import {
  FlightSearchCriteria, Flight,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';

export abstract class FlightAdapter {
  abstract readonly supplierId: string;

  abstract searchFlights(criteria: FlightSearchCriteria): Promise<Flight[]>;

  async getFlightById(_id: string): Promise<Flight | null> {
    return null;
  }

  abstract createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse>;

  abstract cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }>;

  abstract initialize(credentials: Record<string, string>, config?: Record<string, unknown>): void;
}
