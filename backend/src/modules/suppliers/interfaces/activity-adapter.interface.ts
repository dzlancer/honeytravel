import {
  ActivitySearchCriteria, Activity,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';

export abstract class ActivityAdapter {
  abstract readonly supplierId: string;

  abstract searchActivities(criteria: ActivitySearchCriteria): Promise<Activity[]>;

  async getActivityById(_id: string): Promise<Activity | null> {
    return null;
  }

  abstract createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse>;

  abstract cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }>;

  abstract initialize(credentials: Record<string, string>, config?: Record<string, unknown>): void;
}
