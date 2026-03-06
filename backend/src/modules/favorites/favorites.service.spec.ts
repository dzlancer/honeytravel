import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { ProductType } from '../bookings/entities/booking.entity';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoriteRepo: jest.Mocked<Partial<Repository<Favorite>>>;

  const mockFavorite: Partial<Favorite> = {
    id: 'fav-1',
    userId: 'user-1',
    productType: ProductType.HOTEL,
    productId: 'hotel-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    favoriteRepo = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'fav-1', ...dto })),
      save: jest.fn().mockImplementation((f) => Promise.resolve(f)),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: favoriteRepo },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should add a new favorite when it does not exist', async () => {
      favoriteRepo.findOne!.mockResolvedValue(null);

      const result = await service.add('user-1', ProductType.HOTEL, 'hotel-1');

      expect(result).toHaveProperty('id');
      expect(favoriteRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', productType: ProductType.HOTEL, productId: 'hotel-1' },
      });
      expect(favoriteRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        productType: ProductType.HOTEL,
        productId: 'hotel-1',
      });
      expect(favoriteRepo.save).toHaveBeenCalled();
    });

    it('should return existing favorite if already added (idempotent)', async () => {
      favoriteRepo.findOne!.mockResolvedValue(mockFavorite as Favorite);

      const result = await service.add('user-1', ProductType.HOTEL, 'hotel-1');

      expect(result).toEqual(mockFavorite);
      expect(favoriteRepo.create).not.toHaveBeenCalled();
      expect(favoriteRepo.save).not.toHaveBeenCalled();
    });

    it('should support different product types', async () => {
      favoriteRepo.findOne!.mockResolvedValue(null);

      await service.add('user-1', ProductType.FLIGHT, 'flight-1');

      expect(favoriteRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ productType: ProductType.FLIGHT }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a favorite by userId, productType and productId', async () => {
      await service.remove('user-1', 'hotel', 'hotel-1');

      expect(favoriteRepo.delete).toHaveBeenCalledWith({
        userId: 'user-1',
        productType: ProductType.HOTEL,
        productId: 'hotel-1',
      });
    });

    it('should handle removing non-existent favorite gracefully', async () => {
      favoriteRepo.delete!.mockResolvedValue({ affected: 0, raw: [] });

      // Should not throw
      await service.remove('user-1', 'hotel', 'nonexistent');

      expect(favoriteRepo.delete).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return all favorites for a user', async () => {
      favoriteRepo.find!.mockResolvedValue([mockFavorite as Favorite]);

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(1);
      expect(favoriteRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by product type when specified', async () => {
      favoriteRepo.find!.mockResolvedValue([mockFavorite as Favorite]);

      await service.findByUser('user-1', 'hotel');

      expect(favoriteRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1', productType: 'hotel' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no favorites exist', async () => {
      favoriteRepo.find!.mockResolvedValue([]);

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(0);
    });

    it('should not include productType in where clause when type is undefined', async () => {
      favoriteRepo.find!.mockResolvedValue([]);

      await service.findByUser('user-1', undefined);

      expect(favoriteRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('isFavorited', () => {
    it('should return true when the product is favorited', async () => {
      favoriteRepo.count!.mockResolvedValue(1);

      const result = await service.isFavorited('user-1', 'hotel', 'hotel-1');

      expect(result).toBe(true);
      expect(favoriteRepo.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          productType: ProductType.HOTEL,
          productId: 'hotel-1',
        },
      });
    });

    it('should return false when the product is not favorited', async () => {
      favoriteRepo.count!.mockResolvedValue(0);

      const result = await service.isFavorited('user-1', 'hotel', 'hotel-999');

      expect(result).toBe(false);
    });

    it('should work with different product types', async () => {
      favoriteRepo.count!.mockResolvedValue(1);

      const result = await service.isFavorited('user-1', 'flight', 'flight-1');

      expect(result).toBe(true);
      expect(favoriteRepo.count).toHaveBeenCalledWith({
        where: expect.objectContaining({ productType: ProductType.FLIGHT }),
      });
    });
  });
});
