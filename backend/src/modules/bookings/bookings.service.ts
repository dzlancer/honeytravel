import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Booking, BookingStatus } from './entities/booking.entity';
import { SupplierRegistryService } from '../suppliers/supplier-registry.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private supplierRegistry: SupplierRegistryService,
    private loyaltyService: LoyaltyService,
    @InjectQueue('bookings') private bookingQueue: Queue,
  ) {}

  async create(userId: string, dto: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingRepo.create({
      ...dto,
      userId,
      status: BookingStatus.PENDING,
    });

    // Calculate loyalty points earned (10 points per dollar)
    const earnedPoints = Math.floor(Number(booking.totalAmount) * 10);
    booking.loyaltyPointsEarned = earnedPoints;

    const saved = await this.bookingRepo.save(booking);

    // Queue async tasks
    await this.bookingQueue.add('booking.created', {
      bookingId: saved.id,
      userId,
    });

    return saved;
  }

  async confirm(bookingId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);

    // Call supplier to create the booking
    const adapter = this.supplierRegistry.getAdapter(booking.supplierId);
    if (adapter) {
      try {
        const result = await adapter.createBooking({
          hotelId: booking.productId,
          roomId: 'R001',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guestDetails?.map((g) => ({
            firstName: g.firstName,
            lastName: g.lastName,
            email: g.email || '',
          })) || [],
        });
        booking.supplierBookingRef = result.bookingRef;
      } catch (error) {
        this.logger.error(`Supplier booking failed: ${error}`);
        booking.status = BookingStatus.FAILED;
        return this.bookingRepo.save(booking);
      }
    }

    booking.status = BookingStatus.CONFIRMED;
    const confirmed = await this.bookingRepo.save(booking);

    // Award loyalty points
    await this.loyaltyService.awardPoints(
      booking.userId,
      booking.loyaltyPointsEarned,
      bookingId,
      `Points earned for booking ${bookingId}`,
    );

    await this.bookingQueue.add('booking.confirmed', { bookingId });

    return confirmed;
  }

  async cancel(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (booking.userId !== userId) throw new BadRequestException('Not your booking');
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    // Cancel with supplier
    if (booking.supplierBookingRef) {
      const adapter = this.supplierRegistry.getAdapter(booking.supplierId);
      if (adapter) {
        await adapter.cancelBooking(booking.supplierBookingRef);
      }
    }

    // Reverse loyalty points
    if (booking.loyaltyPointsEarned > 0) {
      await this.loyaltyService.deductPoints(
        booking.userId,
        booking.loyaltyPointsEarned,
        bookingId,
        `Points reversed for cancelled booking ${bookingId}`,
      );
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepo.save(booking);
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByUserId(userId: string, page = 1, limit = 20) {
    const [bookings, total] = await this.bookingRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { bookings, total, page, limit };
  }

  async findAll(page = 1, limit = 20) {
    const [bookings, total] = await this.bookingRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { bookings, total, page, limit };
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    await this.bookingRepo.update(id, { status });
    return this.findById(id);
  }
}
