import { Injectable, Logger } from '@nestjs/common';
import { CarRentalAdapter } from '../interfaces/car-rental-adapter.interface';
import {
  CarSearchCriteria, CarRental,
  SupplierBookingRequest, SupplierBookingResponse,
} from '../../../../../shared/types/supplier';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MockCarRentalAdapter extends CarRentalAdapter {
  readonly supplierId = 'mock-cars';
  private readonly logger = new Logger(MockCarRentalAdapter.name);

  initialize(credentials: Record<string, string>): void {
    this.logger.log(`MockCarRentalAdapter initialized for supplier: ${this.supplierId}`);
  }

  private static readonly CAR_IDS = {
    SYMBOL: 'c1a2r3s4-d5e6-7890-abcd-carrental0001',
    PEUGEOT: 'c1a2r3s4-d5e6-7890-abcd-carrental0002',
    CRUISER: 'c1a2r3s4-d5e6-7890-abcd-carrental0003',
  };

  private getMockCars(): CarRental[] {
    return [
      {
        id: MockCarRentalAdapter.CAR_IDS.SYMBOL,
        supplierId: this.supplierId,
        supplierCarId: 'CAR-SYM-01',
        name: 'Renault Symbol Economy',
        category: 'economy',
        make: 'Renault',
        model: 'Symbol',
        year: 2024,
        transmission: 'manual',
        fuelType: 'Gasoline',
        seats: 5,
        bags: 2,
        features: ['Air Conditioning', 'USB Charging', 'FM Radio'],
        pickupLocation: { city: 'Algiers', address: 'Houari Boumediene Airport, Terminal 1' },
        dropoffLocation: { city: 'Algiers', address: 'Houari Boumediene Airport, Terminal 1' },
        pricePerDay: 25,
        currency: 'USD',
        images: [
          'https://images.unsplash.com/photo-1549317661-bd32c8ce0abb?w=800',
          'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
        ],
        mileagePolicy: '200 km/day included',
        insuranceIncluded: true,
        avgRating: 4.2,
        reviewCount: 156,
      },
      {
        id: MockCarRentalAdapter.CAR_IDS.PEUGEOT,
        supplierId: this.supplierId,
        supplierCarId: 'CAR-PG3-01',
        name: 'Peugeot 3008 SUV',
        category: 'suv',
        make: 'Peugeot',
        model: '3008',
        year: 2025,
        transmission: 'automatic',
        fuelType: 'Diesel',
        seats: 5,
        bags: 4,
        features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Rear Camera', 'Cruise Control'],
        pickupLocation: { city: 'Algiers', address: 'Houari Boumediene Airport, Terminal 1' },
        dropoffLocation: { city: 'Algiers', address: 'Houari Boumediene Airport, Terminal 1' },
        pricePerDay: 65,
        currency: 'USD',
        images: [
          'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        ],
        mileagePolicy: '300 km/day included',
        insuranceIncluded: true,
        avgRating: 4.5,
        reviewCount: 98,
      },
      {
        id: MockCarRentalAdapter.CAR_IDS.CRUISER,
        supplierId: this.supplierId,
        supplierCarId: 'CAR-TLC-01',
        name: 'Toyota Land Cruiser',
        category: 'suv',
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2024,
        transmission: 'automatic',
        fuelType: 'Diesel',
        seats: 7,
        bags: 5,
        features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', '4WD', 'Roof Rack', 'Spare Tire', 'Desert Kit'],
        pickupLocation: { city: 'Ghardaia', address: 'Noumerate Airport' },
        dropoffLocation: { city: 'Ghardaia', address: 'Noumerate Airport' },
        pricePerDay: 120,
        currency: 'USD',
        images: [
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        ],
        mileagePolicy: 'Unlimited',
        insuranceIncluded: true,
        avgRating: 4.8,
        reviewCount: 64,
      },
    ];
  }

  async searchCars(criteria: CarSearchCriteria): Promise<CarRental[]> {
    this.logger.log(`Searching cars: ${JSON.stringify(criteria)}`);
    const cars = this.getMockCars();

    return cars.filter((c) => {
      if (criteria.pickupLocation) {
        const loc = criteria.pickupLocation.toLowerCase();
        if (!c.pickupLocation.city.toLowerCase().includes(loc) &&
            !c.pickupLocation.address.toLowerCase().includes(loc)) {
          return false;
        }
      }
      if (criteria.category && c.category !== criteria.category) return false;
      if (criteria.transmission && c.transmission !== criteria.transmission) return false;
      if (criteria.minPrice && c.pricePerDay < criteria.minPrice) return false;
      if (criteria.maxPrice && c.pricePerDay > criteria.maxPrice) return false;
      return true;
    });
  }

  async getCarById(id: string): Promise<CarRental | null> {
    return this.getMockCars().find((c) => c.id === id) || null;
  }

  async createBooking(details: SupplierBookingRequest): Promise<SupplierBookingResponse> {
    this.logger.log(`Creating car rental booking: ${JSON.stringify(details)}`);
    return {
      success: true,
      bookingRef: `MOCK-CAR-${uuid().slice(0, 8).toUpperCase()}`,
      confirmationNumber: `CAR-${Date.now()}`,
      status: 'confirmed',
    };
  }

  async cancelBooking(bookingRef: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Cancelling car rental booking: ${bookingRef}`);
    return { success: true, message: `Car rental booking ${bookingRef} cancelled successfully` };
  }
}
