import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { SupplierRegistryService } from './supplier-registry.service';
import { SearchCriteria } from '../../../../shared/types/supplier';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectRepository(Hotel)
    private hotelRepo: Repository<Hotel>,
    private registry: SupplierRegistryService,
  ) {}

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
}
