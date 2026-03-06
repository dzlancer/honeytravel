import { Injectable, Logger } from '@nestjs/common';
import { FlightAdapter } from '../interfaces/flight-adapter.interface';
import {
  FlightSearchCriteria, Flight,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockFlightAdapter extends FlightAdapter {
  readonly supplierId = 'mock-flights';
  private readonly logger = new Logger(MockFlightAdapter.name);

  initialize(credentials: Record<string, string>): void {
    this.logger.log(`MockFlightAdapter initialized for supplier: ${this.supplierId}`);
  }

  private static readonly FLIGHT_IDS = {
    ALG_ORN: 'f1a2b3c4-d5e6-7890-abcd-flight0000001',
    ALG_CZL: 'f1a2b3c4-d5e6-7890-abcd-flight0000002',
    ALG_CDG: 'f1a2b3c4-d5e6-7890-abcd-flight0000003',
  };

  private getMockFlights(): Flight[] {
    return [
      {
        id: MockFlightAdapter.FLIGHT_IDS.ALG_ORN,
        supplierId: this.supplierId,
        supplierFlightId: 'AH-1024',
        segments: [{
          airline: 'Air Algerie',
          flightNumber: 'AH 1024',
          departure: {
            airport: { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
            dateTime: '2026-04-15T08:00:00',
          },
          arrival: {
            airport: { code: 'ORN', name: 'Ahmed Ben Bella Airport', city: 'Oran', country: 'Algeria' },
            dateTime: '2026-04-15T09:15:00',
          },
          duration: '1h 15m',
          cabinClass: 'economy',
        }],
        stops: 0,
        totalDuration: '1h 15m',
        price: 85,
        currency: 'USD',
        seatsAvailable: 42,
        baggage: { cabin: '7 kg', checked: '23 kg' },
        refundable: true,
        images: ['https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800'],
      },
      {
        id: MockFlightAdapter.FLIGHT_IDS.ALG_CZL,
        supplierId: this.supplierId,
        supplierFlightId: 'AH-2048',
        segments: [{
          airline: 'Air Algerie',
          flightNumber: 'AH 2048',
          departure: {
            airport: { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
            dateTime: '2026-04-15T10:30:00',
          },
          arrival: {
            airport: { code: 'CZL', name: 'Mohamed Boudiaf Airport', city: 'Constantine', country: 'Algeria' },
            dateTime: '2026-04-15T11:35:00',
          },
          duration: '1h 05m',
          cabinClass: 'economy',
        }],
        stops: 0,
        totalDuration: '1h 05m',
        price: 75,
        currency: 'USD',
        seatsAvailable: 28,
        baggage: { cabin: '7 kg', checked: '23 kg' },
        refundable: true,
        images: ['https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800'],
      },
      {
        id: MockFlightAdapter.FLIGHT_IDS.ALG_CDG,
        supplierId: this.supplierId,
        supplierFlightId: 'AH-5012',
        segments: [{
          airline: 'Air Algerie',
          flightNumber: 'AH 5012',
          departure: {
            airport: { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
            dateTime: '2026-04-16T14:00:00',
          },
          arrival: {
            airport: { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
            dateTime: '2026-04-16T16:20:00',
          },
          duration: '2h 20m',
          cabinClass: 'economy',
        }],
        stops: 0,
        totalDuration: '2h 20m',
        price: 320,
        currency: 'USD',
        seatsAvailable: 15,
        baggage: { cabin: '10 kg', checked: '23 kg' },
        refundable: false,
        images: ['https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800'],
      },
    ];
  }

  async searchFlights(criteria: FlightSearchCriteria): Promise<Flight[]> {
    this.logger.log(`Searching flights: ${JSON.stringify(criteria)}`);
    const flights = this.getMockFlights();

    return flights.filter((f) => {
      const seg = f.segments[0];
      if (criteria.origin) {
        const o = criteria.origin.toLowerCase();
        if (!seg.departure.airport.city.toLowerCase().includes(o) &&
            !seg.departure.airport.code.toLowerCase().includes(o)) {
          return false;
        }
      }
      if (criteria.destination) {
        const d = criteria.destination.toLowerCase();
        if (!seg.arrival.airport.city.toLowerCase().includes(d) &&
            !seg.arrival.airport.code.toLowerCase().includes(d)) {
          return false;
        }
      }
      if (criteria.directOnly && f.stops > 0) return false;
      return true;
    });
  }

  async getFlightById(id: string): Promise<Flight | null> {
    return this.getMockFlights().find((f) => f.id === id) || null;
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating flight booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-FL-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `FL-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling flight booking: ${bookingRef}`);
    return { success: true, message: `Flight booking ${bookingRef} cancelled successfully` };
  }
}
