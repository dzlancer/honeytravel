import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus, ProductType } from '../bookings/entities/booking.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: jest.Mocked<Partial<Repository<Review>>>;
  let bookingsService: jest.Mocked<Partial<BookingsService>>;

  const mockReview: Partial<Review> = {
    id: 'review-1',
    userId: 'user-1',
    productType: ProductType.HOTEL,
    productId: 'hotel-1',
    rating: 4,
    title: 'Great stay',
    comment: 'Loved the experience',
    helpfulCount: 0,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    reviewRepo = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'review-1', ...dto })),
      save: jest.fn().mockImplementation((r) => Promise.resolve(r)),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { rating: 4, count: '3' },
          { rating: 5, count: '2' },
        ]),
      }),
    };
    bookingsService = {
      findByUserId: jest.fn().mockResolvedValue({ bookings: [], total: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: BookingsService, useValue: bookingsService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      productType: ProductType.HOTEL,
      productId: 'hotel-1',
      rating: 4,
      title: 'Great stay',
      comment: 'Wonderful experience',
    };

    it('should create a review without verified badge when no booking exists', async () => {
      bookingsService.findByUserId!.mockResolvedValue({ bookings: [], total: 0 } as any);

      const result = await service.create('user-1', createDto);

      expect(result).toHaveProperty('id');
      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          userId: 'user-1',
          isVerified: false,
        }),
      );
    });

    it('should create with verified badge when user has confirmed booking for the product', async () => {
      bookingsService.findByUserId!.mockResolvedValue({
        bookings: [
          {
            productType: ProductType.HOTEL,
            productId: 'hotel-1',
            status: BookingStatus.CONFIRMED,
          },
        ],
        total: 1,
      } as any);

      await service.create('user-1', createDto);

      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: true }),
      );
    });

    it('should create with verified badge for completed booking', async () => {
      bookingsService.findByUserId!.mockResolvedValue({
        bookings: [
          {
            productType: ProductType.HOTEL,
            productId: 'hotel-1',
            status: BookingStatus.COMPLETED,
          },
        ],
        total: 1,
      } as any);

      await service.create('user-1', createDto);

      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: true }),
      );
    });

    it('should not verify when booking is for different product', async () => {
      bookingsService.findByUserId!.mockResolvedValue({
        bookings: [
          {
            productType: ProductType.HOTEL,
            productId: 'hotel-999',
            status: BookingStatus.CONFIRMED,
          },
        ],
        total: 1,
      } as any);

      await service.create('user-1', createDto);

      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: false }),
      );
    });

    it('should not verify when booking status is PENDING', async () => {
      bookingsService.findByUserId!.mockResolvedValue({
        bookings: [
          {
            productType: ProductType.HOTEL,
            productId: 'hotel-1',
            status: BookingStatus.PENDING,
          },
        ],
        total: 1,
      } as any);

      await service.create('user-1', createDto);

      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: false }),
      );
    });

    it('should proceed without verification when booking check fails', async () => {
      bookingsService.findByUserId!.mockRejectedValue(new Error('DB error'));

      const result = await service.create('user-1', createDto);

      expect(result).toHaveProperty('id');
      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: false }),
      );
    });

    it('should accept optional images array', async () => {
      await service.create('user-1', { ...createDto, images: ['img1.jpg', 'img2.jpg'] });

      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ images: ['img1.jpg', 'img2.jpg'] }),
      );
    });
  });

  describe('findByProduct', () => {
    it('should return paginated reviews with rating stats', async () => {
      const reviewWithUser = {
        ...mockReview,
        user: { id: 'user-1', firstName: 'John', lastName: 'Doe', passwordHash: 'secret' },
      };
      reviewRepo.findAndCount!.mockResolvedValue([[reviewWithUser as any], 5]);

      const result = await service.findByProduct('hotel', 'hotel-1', 1, 10);

      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('ratingDistribution');
    });

    it('should strip passwordHash from user data in reviews', async () => {
      const reviewWithUser = {
        ...mockReview,
        user: { id: 'user-1', firstName: 'John', lastName: 'Doe', passwordHash: 'secret' },
      };
      reviewRepo.findAndCount!.mockResolvedValue([[reviewWithUser as any], 1]);

      const result = await service.findByProduct('hotel', 'hotel-1');

      const safeUser = (result.reviews[0] as any).user;
      expect(safeUser).not.toHaveProperty('passwordHash');
      expect(safeUser).toHaveProperty('firstName', 'John');
      expect(safeUser).toHaveProperty('lastName', 'Doe');
    });

    it('should handle null user gracefully', async () => {
      reviewRepo.findAndCount!.mockResolvedValue([[{ ...mockReview, user: null } as any], 1]);

      const result = await service.findByProduct('hotel', 'hotel-1');

      expect((result.reviews[0] as any).user).toBeNull();
    });

    it('should calculate average rating from distribution', async () => {
      // Mock returns rating 4 (3 times) and rating 5 (2 times)
      // total = 5 reviews, totalRating = (4*3 + 5*2) = 22, avg = 22/5 = 4.4
      reviewRepo.findAndCount!.mockResolvedValue([[], 5]);

      const result = await service.findByProduct('hotel', 'hotel-1');

      expect(result.averageRating).toBe(4.4);
    });

    it('should return 0 average when no reviews', async () => {
      reviewRepo.findAndCount!.mockResolvedValue([[], 0]);
      (reviewRepo.createQueryBuilder!() as any).getRawMany.mockResolvedValue([]);

      const result = await service.findByProduct('hotel', 'hotel-1');

      expect(result.averageRating).toBe(0);
    });

    it('should include rating distribution object', async () => {
      reviewRepo.findAndCount!.mockResolvedValue([[], 5]);

      const result = await service.findByProduct('hotel', 'hotel-1');

      expect(result.ratingDistribution).toEqual(
        expect.objectContaining({ 1: 0, 2: 0, 3: 0, 4: 3, 5: 2 }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return paginated reviews for a user', async () => {
      reviewRepo.findAndCount!.mockResolvedValue([[mockReview as Review], 1]);

      const result = await service.findByUser('user-1', 1, 10);

      expect(result.reviews).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(reviewRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          order: { createdAt: 'DESC' },
        }),
      );
    });
  });

  describe('markHelpful', () => {
    it('should increment helpful count by 1', async () => {
      reviewRepo.findOne!.mockResolvedValue({ ...mockReview, helpfulCount: 3 } as Review);

      await service.markHelpful('review-1');

      expect(reviewRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ helpfulCount: 4 }),
      );
    });

    it('should throw NotFoundException when review not found', async () => {
      reviewRepo.findOne!.mockResolvedValue(null);

      await expect(service.markHelpful('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should increment from 0', async () => {
      reviewRepo.findOne!.mockResolvedValue({ ...mockReview, helpfulCount: 0 } as Review);

      await service.markHelpful('review-1');

      expect(reviewRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ helpfulCount: 1 }),
      );
    });
  });

  describe('delete', () => {
    it('should delete review when user is the owner', async () => {
      reviewRepo.findOne!.mockResolvedValue(mockReview as Review);

      await service.delete('review-1', 'user-1');

      expect(reviewRepo.remove).toHaveBeenCalledWith(mockReview);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      reviewRepo.findOne!.mockResolvedValue(mockReview as Review);

      await expect(service.delete('review-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
      expect(reviewRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when review not found', async () => {
      reviewRepo.findOne!.mockResolvedValue(null);

      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
