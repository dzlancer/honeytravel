import { Injectable, Logger } from '@nestjs/common';
import { SupplierAdapter } from '../interfaces/supplier-adapter.interface';
import {
  SearchCriteria, AvailabilityRequest, AvailabilityResponse,
  SupplierBookingRequest, SupplierBookingResponse, Hotel,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockHotelAdapter extends SupplierAdapter {
  readonly supplierId = 'mock-hotels';
  private readonly logger = new Logger(MockHotelAdapter.name);
  private credentials: Record<string, string> = {};

  initialize(credentials: Record<string, string>): void {
    this.credentials = credentials;
    this.logger.log(`MockHotelAdapter initialized for supplier: ${this.supplierId}`);
  }

  async searchHotels(criteria: SearchCriteria): Promise<Hotel[]> {
    this.logger.log(`Searching hotels: ${JSON.stringify(criteria)}`);

    // In production, this would call the real supplier API.
    // Here we return mock data that matches the criteria.
    const mockHotels: Hotel[] = [
      {
        id: uuid(),
        supplierId: this.supplierId,
        supplierHotelId: 'MH001',
        name: 'Grand Hotel Algiers',
        description: 'Luxurious 5-star hotel in the heart of Algiers',
        starRating: 5,
        address: { street: '1 Boulevard Che Guevara', city: 'Algiers', country: 'Algeria' },
        location: { lat: 36.7538, lng: 3.0588 },
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'gym'],
        rooms: [
          {
            id: 'R001', name: 'Deluxe Sea View', description: 'Spacious room with sea views',
            maxOccupancy: 2, bedType: 'King', amenities: ['wifi', 'minibar'],
            images: [], pricePerNight: 250, currency: 'USD', available: true,
          },
        ],
        policies: { checkInTime: '14:00', checkOutTime: '12:00', cancellationPolicy: 'Free cancellation up to 24h' },
        avgRating: 4.7, reviewCount: 342, minPrice: 250, currency: 'USD',
      },
      {
        id: uuid(),
        supplierId: this.supplierId,
        supplierHotelId: 'MH002',
        name: 'Sahara Oasis Resort',
        description: 'Desert resort experience in Ghardaia',
        starRating: 4,
        address: { street: 'Route de Ghardaia', city: 'Ghardaia', country: 'Algeria' },
        location: { lat: 32.4912, lng: 3.6735 },
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
        amenities: ['wifi', 'pool', 'restaurant', 'spa'],
        rooms: [
          {
            id: 'R003', name: 'Desert View Room', description: 'Room with desert views',
            maxOccupancy: 2, bedType: 'Queen', amenities: ['wifi'],
            images: [], pricePerNight: 120, currency: 'USD', available: true,
          },
        ],
        policies: { checkInTime: '15:00', checkOutTime: '11:00', cancellationPolicy: 'Free cancellation up to 48h' },
        avgRating: 4.3, reviewCount: 128, minPrice: 120, currency: 'USD',
      },
    ];

    // Simple filter by destination
    return mockHotels.filter((h) => {
      if (criteria.destination) {
        const dest = criteria.destination.toLowerCase();
        return h.address.city.toLowerCase().includes(dest)
          || h.address.country.toLowerCase().includes(dest)
          || h.name.toLowerCase().includes(dest);
      }
      return true;
    });
  }

  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    this.logger.log(`Checking availability: ${JSON.stringify(request)}`);
    return {
      available: true,
      rooms: [
        {
          id: 'R001', name: 'Deluxe Sea View', description: 'Spacious room',
          maxOccupancy: 2, bedType: 'King', amenities: ['wifi', 'minibar'],
          images: [], pricePerNight: 250, currency: 'USD', available: true,
        },
      ],
      totalPrice: 250 * this.calculateNights(request.checkIn, request.checkOut),
      currency: 'USD',
    };
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `CN-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling booking: ${bookingRef}`);
    return { success: true, message: `Booking ${bookingRef} cancelled successfully` };
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
