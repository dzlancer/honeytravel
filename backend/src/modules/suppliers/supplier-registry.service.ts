import { Injectable, Inject, Logger, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierAdapter } from './interfaces/supplier-adapter.interface';
import { FlightAdapter } from './interfaces/flight-adapter.interface';
import { ActivityAdapter } from './interfaces/activity-adapter.interface';
import { CarRentalAdapter } from './interfaces/car-rental-adapter.interface';
import { TourAdapter } from './interfaces/tour-adapter.interface';
import { Supplier } from './entities/supplier.entity';
import { MockHotelAdapter } from './adapters/mock-hotel.adapter';
import { MockFlightAdapter } from './adapters/mock-flight.adapter';
import { MockActivityAdapter } from './adapters/mock-activity.adapter';
import { MockCarRentalAdapter } from './adapters/mock-car-rental.adapter';
import { MockTourAdapter } from './adapters/mock-tour.adapter';
import { TravelShopTurkeyAdapter } from './adapters/travelshopturkey.adapter';
import { SystemConfigService } from '../system-config/system-config.service';
import { decrypt, encrypt } from '../../config/encryption.util';

// Map of known adapter codes to their type category
const ADAPTER_TYPE_MAP: Record<string, string> = {
  'mock-hotel': 'hotel',
  'mock-flights': 'flight',
  'mock-activities': 'activity',
  'mock-cars': 'car_rental',
  'mock-tours': 'tour',
  'travelshopturkey': 'tour',
};

// Map of adapter type to feature flag key
const TYPE_FEATURE_MAP: Record<string, string> = {
  hotel: 'feature.hotels.enabled',
  flight: 'feature.flights.enabled',
  activity: 'feature.activities.enabled',
  car_rental: 'feature.cars.enabled',
  tour: 'feature.tours.enabled',
};

interface DefaultSupplierSeed {
  code: string;
  name: string;
  type: string;
  baseUrl: string;
  isMock: boolean;
  priority: number;
}

@Injectable()
export class SupplierRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SupplierRegistryService.name);
  private adapters = new Map<string, SupplierAdapter>();
  private flightAdapters = new Map<string, FlightAdapter>();
  private activityAdapters = new Map<string, ActivityAdapter>();
  private carAdapters = new Map<string, CarRentalAdapter>();
  private tourAdapters = new Map<string, TourAdapter>();

  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @Inject(forwardRef(() => SystemConfigService))
    private systemConfig: SystemConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultSuppliers();
    await this.loadAdapters();
  }

  // ─── Seed Default Suppliers ──────────────────────────────

  private async seedDefaultSuppliers() {
    const defaults: DefaultSupplierSeed[] = [
      { code: 'mock-hotel', name: 'Mock Hotels', type: 'hotel', baseUrl: 'internal://mock', isMock: true, priority: 0 },
      { code: 'mock-flights', name: 'Mock Flights', type: 'flight', baseUrl: 'internal://mock', isMock: true, priority: 0 },
      { code: 'mock-activities', name: 'Mock Activities', type: 'activity', baseUrl: 'internal://mock', isMock: true, priority: 0 },
      { code: 'mock-cars', name: 'Mock Car Rentals', type: 'car_rental', baseUrl: 'internal://mock', isMock: true, priority: 0 },
      { code: 'mock-tours', name: 'Mock Tours', type: 'tour', baseUrl: 'internal://mock', isMock: true, priority: 0 },
      { code: 'travelshopturkey', name: 'TravelShop Turkey', type: 'tour', baseUrl: 'https://travelshopturkey.com/api/json', isMock: false, priority: 10 },
    ];

    for (const seed of defaults) {
      const exists = await this.supplierRepo.findOne({ where: { code: seed.code } });
      if (!exists) {
        await this.supplierRepo.save(this.supplierRepo.create({
          ...seed,
          encryptedCredentials: encrypt(JSON.stringify({})),
        }));
        this.logger.log(`Seeded supplier: ${seed.code}`);
      }
    }
  }

  // ─── Load All Adapters from DB ───────────────────────────

  private async loadAdapters() {
    // Clear all maps
    this.adapters.clear();
    this.flightAdapters.clear();
    this.activityAdapters.clear();
    this.carAdapters.clear();
    this.tourAdapters.clear();

    try {
      const suppliers = await this.supplierRepo.find({ where: { isActive: true } });
      for (const supplier of suppliers) {
        this.loadSingleAdapter(supplier);
      }
    } catch (error) {
      this.logger.warn(`Could not load suppliers from DB, falling back to hardcoded: ${error}`);
      this.loadFallbackAdapters();
    }
  }

  private loadSingleAdapter(supplier: Supplier): boolean {
    try {
      let credentials: Record<string, string> = {};
      try {
        credentials = JSON.parse(decrypt(supplier.encryptedCredentials));
      } catch {
        // Empty credentials are fine for mock adapters
      }

      switch (supplier.code) {
        case 'mock-hotel': {
          const adapter = new MockHotelAdapter();
          adapter.initialize(credentials);
          this.adapters.set(supplier.code, adapter);
          break;
        }
        case 'mock-flights': {
          const adapter = new MockFlightAdapter();
          adapter.initialize(credentials);
          this.flightAdapters.set(supplier.code, adapter);
          break;
        }
        case 'mock-activities': {
          const adapter = new MockActivityAdapter();
          adapter.initialize(credentials);
          this.activityAdapters.set(supplier.code, adapter);
          break;
        }
        case 'mock-cars': {
          const adapter = new MockCarRentalAdapter();
          adapter.initialize(credentials);
          this.carAdapters.set(supplier.code, adapter);
          break;
        }
        case 'mock-tours': {
          const adapter = new MockTourAdapter();
          adapter.initialize(credentials);
          this.tourAdapters.set(supplier.code, adapter);
          break;
        }
        case 'travelshopturkey': {
          const apiKey = credentials.apiKey || process.env.TRAVELSHOPTURKEY_API_KEY;
          if (!apiKey) {
            this.logger.warn('TravelShopTurkey: no API key, skipping');
            return false;
          }
          const adapter = new TravelShopTurkeyAdapter();
          adapter.initialize(
            { apiKey },
            { baseUrl: supplier.baseUrl || process.env.TRAVELSHOPTURKEY_API_URL || 'https://travelshopturkey.com/api/json' },
          );
          this.tourAdapters.set(supplier.code, adapter);
          break;
        }
        default:
          this.logger.warn(`Unknown adapter code: ${supplier.code}`);
          return false;
      }

      this.logger.log(`Loaded adapter: ${supplier.code} (${supplier.isMock ? 'mock' : 'live'})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to load adapter for ${supplier.code}: ${error}`);
      return false;
    }
  }

  private loadFallbackAdapters() {
    // Hardcoded fallback if DB is unavailable
    const mockAdapter = new MockHotelAdapter();
    mockAdapter.initialize({});
    this.adapters.set('mock-hotel', mockAdapter);

    const mockFlightAdapter = new MockFlightAdapter();
    mockFlightAdapter.initialize({});
    this.flightAdapters.set('mock-flights', mockFlightAdapter);

    const mockActivityAdapter = new MockActivityAdapter();
    mockActivityAdapter.initialize({});
    this.activityAdapters.set('mock-activities', mockActivityAdapter);

    const mockCarAdapter = new MockCarRentalAdapter();
    mockCarAdapter.initialize({});
    this.carAdapters.set('mock-cars', mockCarAdapter);

    const mockTourAdapter = new MockTourAdapter();
    mockTourAdapter.initialize({});
    this.tourAdapters.set('mock-tours', mockTourAdapter);

    this.logger.log('Loaded fallback mock adapters');
  }

  // ─── Runtime Reload ──────────────────────────────────────

  async reloadAdapter(supplierId: string): Promise<boolean> {
    const supplier = await this.supplierRepo.findOne({ where: { id: supplierId } });
    if (!supplier) return false;

    // Remove old adapter by code
    this.removeAdapterByCode(supplier.code);

    // If active, load the new one
    if (supplier.isActive) {
      return this.loadSingleAdapter(supplier);
    }
    this.logger.log(`Adapter ${supplier.code} deactivated at runtime`);
    return true;
  }

  removeAdapterByCode(code: string) {
    this.adapters.delete(code);
    this.flightAdapters.delete(code);
    this.activityAdapters.delete(code);
    this.carAdapters.delete(code);
    this.tourAdapters.delete(code);
  }

  // ─── Cross-map Lookup ────────────────────────────────────

  getAdapterByCode(code: string): any | undefined {
    return this.adapters.get(code)
      || this.flightAdapters.get(code)
      || this.activityAdapters.get(code)
      || this.carAdapters.get(code)
      || this.tourAdapters.get(code);
  }

  // ─── Feature-flag-aware Getters ──────────────────────────

  // Hotel adapters
  getAdapter(supplierId: string): SupplierAdapter | undefined {
    return this.adapters.get(supplierId);
  }

  getAllAdapters(): SupplierAdapter[] {
    if (!this.systemConfig.getBoolean('feature.hotels.enabled', undefined, true)) {
      return [];
    }
    return Array.from(this.adapters.values());
  }

  // Flight adapters
  getFlightAdapter(supplierId: string): FlightAdapter | undefined {
    return this.flightAdapters.get(supplierId);
  }

  getAllFlightAdapters(): FlightAdapter[] {
    if (!this.systemConfig.getBoolean('feature.flights.enabled', undefined, true)) {
      return [];
    }
    return Array.from(this.flightAdapters.values());
  }

  // Activity adapters
  getActivityAdapter(supplierId: string): ActivityAdapter | undefined {
    return this.activityAdapters.get(supplierId);
  }

  getAllActivityAdapters(): ActivityAdapter[] {
    if (!this.systemConfig.getBoolean('feature.activities.enabled', undefined, true)) {
      return [];
    }
    return Array.from(this.activityAdapters.values());
  }

  // Car rental adapters
  getCarAdapter(supplierId: string): CarRentalAdapter | undefined {
    return this.carAdapters.get(supplierId);
  }

  getAllCarAdapters(): CarRentalAdapter[] {
    if (!this.systemConfig.getBoolean('feature.cars.enabled', undefined, true)) {
      return [];
    }
    return Array.from(this.carAdapters.values());
  }

  // Tour adapters
  getTourAdapter(supplierId: string): TourAdapter | undefined {
    return this.tourAdapters.get(supplierId);
  }

  getAllTourAdapters(): TourAdapter[] {
    if (!this.systemConfig.getBoolean('feature.tours.enabled', undefined, true)) {
      return [];
    }
    return Array.from(this.tourAdapters.values());
  }
}
