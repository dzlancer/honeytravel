import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus, ProductType } from './entities/booking.entity';
import { SupplierRegistryService } from '../suppliers/supplier-registry.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: jest.Mocked<Partial<Repository<Booking>>>;
  let supplierRegistry: jest.Mocked<Partial<SupplierRegistryService>>;
  let loyaltyService: jest.Mocked<Partial<LoyaltyService>>;
  let bookingQueue: { add: jest.Mock };

  const mockBooking: Partial<Booking> = {
    id: 'booking-1',
    userId: 'user-1',
    productType: ProductType.HOTEL,
    productId: 'hotel-1',
    supplierId: 'mock-hotel',
    supplierBookingRef: null as any,
    status: BookingStatus.PENDING,
    checkIn: '2026-04-01',
    checkOut: '2026-04-05',
    guestCount: 2,
    totalAmount: 500,
    currency: 'USD',
    loyaltyPointsEarned: 5000,
    loyaltyPointsUsed: 0,
    guestDetails: [{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
  };

  beforeEach(async () => {
    bookingRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((b) => Promise.resolve({ id: 'booking-1', ...b })),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    supplierRegistry = {
      getAdapter: jest.fn(),
    };
    loyaltyService = {
      awardPoints: jest.fn().mockResolvedValue({}),
      deductPoints: jest.fn().mockResolvedValue({}),
      getBalance: jest.fn().mockResolvedValue(5000),
    };
    bookingQueue = { add: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: bookingRepo },
        { provide: SupplierRegistryService, useValue: supplierRegistry },
        { provide: LoyaltyService, useValue: loyaltyService },
        { provide: getQueueToken('bookings'), useValue: bookingQueue },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking with PENDING status', async () => {
      const dto: Partial<Booking> = {
        productType: ProductType.HOTEL,
        productId: 'hotel-1',
        supplierId: 'mock-hotel',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        totalAmount: 500,
        currency: 'USD',
        guestDetails: [{ firstName: 'John', lastName: 'Doe' }],
      };

      const result = await service.create('user-1', dto);

      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.userId).toBe('user-1');
      expect(bookingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', status: BookingStatus.PENDING }),
      );
      expect(bookingRepo.save).toHaveBeenCalled();
    });

    it('should calculate loyalty points at 10 per dollar', async () => {
      const dto: Partial<Booking> = {
        productType: ProductType.HOTEL,
        productId: 'h1',
        supplierId: 's1',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        totalAmount: 250,
        currency: 'USD',
      } as any;

      await service.create('user-1', dto);

      expect(bookingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ loyaltyPointsEarned: 2500 }),
      );
    });

    it('should queue a booking.created event', async () => {
      const dto: Partial<Booking> = {
        productType: ProductType.HOTEL,
        productId: 'h1',
        supplierId: 's1',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        totalAmount: 100,
        currency: 'USD',
      } as any;

      await service.create('user-1', dto);

      expect(bookingQueue.add).toHaveBeenCalledWith(
        'booking.created',
        expect.objectContaining({ userId: 'user-1' }),
      );
    });

    it('should use guestDetails length when no guestCount provided', async () => {
      const dto: Partial<Booking> = {
        productType: ProductType.HOTEL,
        productId: 'h1',
        supplierId: 's1',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        totalAmount: 100,
        currency: 'USD',
        guestDetails: [{ firstName: 'A', lastName: 'B' }, { firstName: 'C', lastName: 'D' }],
      } as any;

      await service.create('user-1', dto);

      expect(bookingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ guestCount: 2 }),
      );
    });

    it('should floor loyalty points for fractional amounts', async () => {
      await service.create('user-1', {
        productType: ProductType.HOTEL,
        productId: 'h1',
        supplierId: 's1',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        totalAmount: 99.99,
        currency: 'USD',
      } as any);

      expect(bookingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ loyaltyPointsEarned: 999 }),
      );
    });
  });

  describe('confirm', () => {
    it('should call supplier adapter and set CONFIRMED', async () => {
      bookingRepo.findOne!.mockResolvedValue({ ...mockBooking, status: BookingStatus.PENDING } as Booking);
      const adapter = {
        createBooking: jest.fn().mockResolvedValue({ bookingRef: 'SUP-123' }),
      };
      supplierRegistry.getAdapter!.mockReturnValue(adapter as any);

      const result = await service.confirm('booking-1');

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(result.supplierBookingRef).toBe('SUP-123');
      expect(adapter.createBooking).toHaveBeenCalled();
      expect(loyaltyService.awardPoints).toHaveBeenCalledWith(
        'user-1',
        5000,
        'booking-1',
        expect.stringContaining('booking-1'),
      );
    });

    it('should set status to FAILED when supplier throws', async () => {
      bookingRepo.findOne!.mockResolvedValue({ ...mockBooking, status: BookingStatus.PENDING } as Booking);
      const adapter = {
        createBooking: jest.fn().mockRejectedValue(new Error('Supplier timeout')),
      };
      supplierRegistry.getAdapter!.mockReturnValue(adapter as any);

      const result = await service.confirm('booking-1');

      expect(result.status).toBe(BookingStatus.FAILED);
      expect(loyaltyService.awardPoints).not.toHaveBeenCalled();
    });

    it('should confirm without supplier when no adapter found', async () => {
      bookingRepo.findOne!.mockResolvedValue({ ...mockBooking, status: BookingStatus.PENDING } as Booking);
      supplierRegistry.getAdapter!.mockReturnValue(undefined);

      const result = await service.confirm('booking-1');

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(loyaltyService.awardPoints).toHaveBeenCalled();
    });

    it('should queue booking.confirmed event after confirmation', async () => {
      bookingRepo.findOne!.mockResolvedValue({ ...mockBooking, status: BookingStatus.PENDING } as Booking);
      supplierRegistry.getAdapter!.mockReturnValue(undefined);

      await service.confirm('booking-1');

      expect(bookingQueue.add).toHaveBeenCalledWith(
        'booking.confirmed',
        expect.objectContaining({ bookingId: 'booking-1' }),
      );
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      bookingRepo.findOne!.mockResolvedValue(null);

      await expect(service.confirm('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel a confirmed booking and reverse loyalty points', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        supplierBookingRef: 'SUP-123',
      } as Booking);
      loyaltyService.getBalance!.mockResolvedValue(5000);
      const adapter = { cancelBooking: jest.fn().mockResolvedValue({}) };
      supplierRegistry.getAdapter!.mockReturnValue(adapter as any);

      const result = await service.cancel('booking-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(adapter.cancelBooking).toHaveBeenCalledWith('SUP-123');
      expect(loyaltyService.deductPoints).toHaveBeenCalledWith(
        'user-1',
        5000,
        'booking-1',
        expect.stringContaining('cancelled'),
      );
    });

    it('should throw BadRequestException when not the booking owner', async () => {
      bookingRepo.findOne!.mockResolvedValue(mockBooking as Booking);

      await expect(service.cancel('booking-1', 'other-user')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-cancellable status', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      } as Booking);

      await expect(service.cancel('booking-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should skip loyalty reversal when insufficient balance', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      } as Booking);
      loyaltyService.getBalance!.mockResolvedValue(100);
      supplierRegistry.getAdapter!.mockReturnValue(undefined);

      const result = await service.cancel('booking-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(loyaltyService.deductPoints).not.toHaveBeenCalled();
    });

    it('should cancel pending booking without loyalty reversal', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.PENDING,
      } as Booking);
      supplierRegistry.getAdapter!.mockReturnValue(undefined);

      const result = await service.cancel('booking-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(loyaltyService.deductPoints).not.toHaveBeenCalled();
      expect(loyaltyService.getBalance).not.toHaveBeenCalled();
    });

    it('should still cancel even if supplier cancellation fails', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        supplierBookingRef: 'SUP-123',
      } as Booking);
      loyaltyService.getBalance!.mockResolvedValue(5000);
      const adapter = {
        cancelBooking: jest.fn().mockRejectedValue(new Error('Supplier down')),
      };
      supplierRegistry.getAdapter!.mockReturnValue(adapter as any);

      const result = await service.cancel('booking-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should handle loyalty deduction error gracefully', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      } as Booking);
      loyaltyService.getBalance!.mockRejectedValue(new Error('DB error'));
      supplierRegistry.getAdapter!.mockReturnValue(undefined);

      const result = await service.cancel('booking-1', 'user-1');

      // Should still cancel even if loyalty check throws
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should not attempt supplier cancellation when no supplierBookingRef', async () => {
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
        supplierBookingRef: null as any,
      } as Booking);
      loyaltyService.getBalance!.mockResolvedValue(5000);

      await service.cancel('booking-1', 'user-1');

      expect(supplierRegistry.getAdapter).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return booking when found', async () => {
      bookingRepo.findOne!.mockResolvedValue(mockBooking as Booking);

      const result = await service.findById('booking-1');

      expect(result).toEqual(mockBooking);
      expect(bookingRepo.findOne).toHaveBeenCalledWith({ where: { id: 'booking-1' } });
    });

    it('should throw NotFoundException when not found', async () => {
      bookingRepo.findOne!.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return paginated bookings for a user', async () => {
      bookingRepo.findAndCount!.mockResolvedValue([[mockBooking as Booking], 1]);

      const result = await service.findByUserId('user-1', 1, 20);

      expect(result.bookings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(bookingRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          order: { createdAt: 'DESC' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should calculate correct offset for page 2', async () => {
      bookingRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findByUserId('user-1', 2, 10);

      expect(bookingRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all bookings with user relation', async () => {
      bookingRepo.findAndCount!.mockResolvedValue([[mockBooking as Booking], 1]);

      const result = await service.findAll(1, 20);

      expect(result.bookings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(bookingRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['user'] }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update booking status and return updated booking', async () => {
      bookingRepo.update!.mockResolvedValue({ affected: 1 } as any);
      bookingRepo.findOne!.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      } as Booking);

      const result = await service.updateStatus('booking-1', BookingStatus.COMPLETED);

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(bookingRepo.update).toHaveBeenCalledWith('booking-1', {
        status: BookingStatus.COMPLETED,
      });
    });
  });
});
