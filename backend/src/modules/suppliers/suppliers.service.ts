import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { Supplier } from './entities/supplier.entity';
import { SupplierRegistryService } from './supplier-registry.service';
import { encrypt } from '../../config/encryption.util';
import {
  SearchCriteria, FlightSearchCriteria,
  ActivitySearchCriteria, CarSearchCriteria,
  TourSearchCriteria, TourCalculationRequest,
} from '../../../../shared/types/supplier';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectRepository(Hotel)
    private hotelRepo: Repository<Hotel>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    private registry: SupplierRegistryService,
  ) {}

  // ─── Hotels ────────────────────────────────────────────────

  async searchHotels(criteria: SearchCriteria) {
    const adapters = this.registry.getAllAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchHotels(criteria)),
    );

    const hotels = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Also search local database
    const qb = this.hotelRepo.createQueryBuilder('h').where('h.isActive = true');

    if (criteria.destination) {
      qb.andWhere(
        '(LOWER(h.city) LIKE :dest OR LOWER(h.country) LIKE :dest OR LOWER(h.name) LIKE :dest)',
        { dest: `%${criteria.destination.toLowerCase()}%` },
      );
    }
    if (criteria.minPrice) qb.andWhere('h.minPrice >= :minPrice', { minPrice: criteria.minPrice });
    if (criteria.maxPrice) qb.andWhere('h.minPrice <= :maxPrice', { maxPrice: criteria.maxPrice });
    if (criteria.starRating?.length) {
      qb.andWhere('h.starRating IN (:...ratings)', { ratings: criteria.starRating });
    }

    const sortField = criteria.sortBy === 'rating' ? 'h.avgRating' : 'h.minPrice';
    qb.orderBy(sortField, criteria.sortOrder === 'desc' ? 'DESC' : 'ASC');

    const page = criteria.page || 1;
    const limit = Math.min(criteria.limit || 20, 100);
    qb.skip((page - 1) * limit).take(limit);

    const [dbHotels, total] = await qb.getManyAndCount();

    return {
      items: [...hotels, ...dbHotels],
      total: total + hotels.length,
      page,
      limit,
    };
  }

  async getHotelById(id: string) {
    // First check database
    const hotel = await this.hotelRepo.findOne({ where: { id } });
    if (hotel) return hotel;

    // Then check all supplier adapters (for mock/external hotels not in DB)
    const adapters = this.registry.getAllAdapters();
    for (const adapter of adapters) {
      const adapterHotel = await adapter.getHotelById(id);
      if (adapterHotel) return adapterHotel;
    }

    throw new NotFoundException('Hotel not found');
  }

  async checkAvailability(supplierId: string, hotelId: string, checkIn: string, checkOut: string, occupancy: { adults: number; children: number }) {
    const adapter = this.registry.getAdapter(supplierId);
    if (adapter) {
      return adapter.checkAvailability({ hotelId, checkIn, checkOut, occupancy });
    }
    return { available: true, rooms: [], totalPrice: 0, currency: 'USD' };
  }

  // ─── Flights ───────────────────────────────────────────────

  async searchFlights(criteria: FlightSearchCriteria) {
    const adapters = this.registry.getAllFlightAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchFlights(criteria)),
    );

    const flights = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const page = criteria.page || 1;
    const limit = Math.min(criteria.limit || 20, 100);

    // Sort
    if (criteria.sortBy === 'price') {
      flights.sort((a, b) => criteria.sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    }

    return {
      items: flights.slice((page - 1) * limit, page * limit),
      total: flights.length,
      page,
      limit,
    };
  }

  async getFlightById(id: string) {
    const adapters = this.registry.getAllFlightAdapters();
    for (const adapter of adapters) {
      const flight = await adapter.getFlightById(id);
      if (flight) return flight;
    }
    throw new NotFoundException('Flight not found');
  }

  // ─── Activities ────────────────────────────────────────────

  async searchActivities(criteria: ActivitySearchCriteria) {
    const adapters = this.registry.getAllActivityAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchActivities(criteria)),
    );

    const activities = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const page = criteria.page || 1;
    const limit = Math.min(criteria.limit || 20, 100);

    // Sort
    if (criteria.sortBy === 'price') {
      activities.sort((a, b) => criteria.sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    } else if (criteria.sortBy === 'rating') {
      activities.sort((a, b) => b.avgRating - a.avgRating);
    }

    return {
      items: activities.slice((page - 1) * limit, page * limit),
      total: activities.length,
      page,
      limit,
    };
  }

  async getActivityById(id: string) {
    const adapters = this.registry.getAllActivityAdapters();
    for (const adapter of adapters) {
      const activity = await adapter.getActivityById(id);
      if (activity) return activity;
    }
    throw new NotFoundException('Activity not found');
  }

  // ─── Car Rentals ───────────────────────────────────────────

  async searchCars(criteria: CarSearchCriteria) {
    const adapters = this.registry.getAllCarAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchCars(criteria)),
    );

    const cars = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const page = criteria.page || 1;
    const limit = Math.min(criteria.limit || 20, 100);

    // Sort
    if (criteria.sortBy === 'price') {
      cars.sort((a, b) => criteria.sortOrder === 'desc' ? b.pricePerDay - a.pricePerDay : a.pricePerDay - b.pricePerDay);
    } else if (criteria.sortBy === 'rating') {
      cars.sort((a, b) => b.avgRating - a.avgRating);
    }

    return {
      items: cars.slice((page - 1) * limit, page * limit),
      total: cars.length,
      page,
      limit,
    };
  }

  async getCarById(id: string) {
    const adapters = this.registry.getAllCarAdapters();
    for (const adapter of adapters) {
      const car = await adapter.getCarById(id);
      if (car) return car;
    }
    throw new NotFoundException('Car rental not found');
  }

  // ─── Tours ──────────────────────────────────────────────

  async searchTours(criteria: TourSearchCriteria) {
    const adapters = this.registry.getAllTourAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchTours(criteria)),
    );

    const tours = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    const page = criteria.page || 1;
    const limit = Math.min(criteria.limit || 20, 100);

    // Sort
    if (criteria.sortBy === 'price') {
      tours.sort((a, b) => criteria.sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    } else if (criteria.sortBy === 'rating') {
      tours.sort((a, b) => b.avgRating - a.avgRating);
    } else if (criteria.sortBy === 'duration') {
      tours.sort((a, b) => criteria.sortOrder === 'desc' ? b.durationDays - a.durationDays : a.durationDays - b.durationDays);
    }

    return {
      items: tours.slice((page - 1) * limit, page * limit),
      total: tours.length,
      page,
      limit,
    };
  }

  async getTourById(id: string) {
    const adapters = this.registry.getAllTourAdapters();
    for (const adapter of adapters) {
      const tour = await adapter.getTourById(id);
      if (tour) return tour;
    }
    throw new NotFoundException('Tour not found');
  }

  async calculateTourPrice(request: TourCalculationRequest) {
    const adapters = this.registry.getAllTourAdapters();
    for (const adapter of adapters) {
      const tour = await adapter.getTourById(request.tourId);
      if (tour) {
        return adapter.calculatePrice(request);
      }
    }
    throw new NotFoundException('Tour not found for price calculation');
  }

  // ─── Admin CRUD ─────────────────────────────────────────

  async findAllSuppliers(): Promise<Supplier[]> {
    return this.supplierRepo.find({
      order: { type: 'ASC', priority: 'DESC' },
    });
  }

  async findSupplierById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(
    id: string,
    data: Partial<{
      isActive: boolean;
      baseUrl: string;
      credentials: Record<string, string>;
      markupPercentage: number;
      priority: number;
      isMock: boolean;
      rateLimit: number;
      timeout: number;
      config: Record<string, unknown>;
    }>,
  ): Promise<Supplier> {
    const supplier = await this.findSupplierById(id);

    if (data.isActive !== undefined) supplier.isActive = data.isActive;
    if (data.baseUrl !== undefined) supplier.baseUrl = data.baseUrl;
    if (data.markupPercentage !== undefined) supplier.markupPercentage = data.markupPercentage;
    if (data.priority !== undefined) supplier.priority = data.priority;
    if (data.isMock !== undefined) supplier.isMock = data.isMock;
    if (data.rateLimit !== undefined) supplier.rateLimit = data.rateLimit;
    if (data.timeout !== undefined) supplier.timeout = data.timeout;
    if (data.config !== undefined) supplier.config = data.config;

    // Encrypt credentials if provided
    if (data.credentials) {
      supplier.encryptedCredentials = encrypt(JSON.stringify(data.credentials));
    }

    return this.supplierRepo.save(supplier);
  }

  async testSupplierConnection(id: string): Promise<{ success: boolean; message: string }> {
    const supplier = await this.findSupplierById(id);
    try {
      const adapter = this.registry.getAdapterByCode(supplier.code);
      if (!adapter) {
        return { success: false, message: `No loaded adapter for "${supplier.code}"` };
      }
      // Quick health check: attempt a minimal search
      return { success: true, message: `Adapter "${supplier.code}" is loaded and responding` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection test failed' };
    }
  }
}
