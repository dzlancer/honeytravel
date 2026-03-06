import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import {
  LoyaltyTransaction,
  LoyaltyTransactionType,
} from './entities/loyalty-transaction.entity';
import { UsersService } from '../users/users.service';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let loyaltyRepo: jest.Mocked<Partial<Repository<LoyaltyTransaction>>>;
  let usersService: jest.Mocked<Partial<UsersService>>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    loyaltyPoints: 1000,
  };

  const mockTransaction: Partial<LoyaltyTransaction> = {
    id: 'tx-1',
    userId: 'user-1',
    bookingId: 'booking-1',
    points: 500,
    type: LoyaltyTransactionType.EARNED,
    description: 'Points earned',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    loyaltyRepo = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'tx-1', ...dto })),
      save: jest.fn().mockImplementation((tx) => Promise.resolve(tx)),
      findAndCount: jest.fn(),
    };
    usersService = {
      findById: jest.fn().mockResolvedValue(mockUser),
      updateLoyaltyPoints: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        { provide: getRepositoryToken(LoyaltyTransaction), useValue: loyaltyRepo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('awardPoints', () => {
    it('should create EARNED transaction and update user points', async () => {
      const result = await service.awardPoints('user-1', 500, 'booking-1', 'Points earned');

      expect(result).toHaveProperty('id');
      expect(loyaltyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          bookingId: 'booking-1',
          points: 500,
          type: LoyaltyTransactionType.EARNED,
          description: 'Points earned',
        }),
      );
      expect(loyaltyRepo.save).toHaveBeenCalled();
      expect(usersService.updateLoyaltyPoints).toHaveBeenCalledWith('user-1', 500);
    });

    it('should store positive points value', async () => {
      await service.awardPoints('user-1', 1000, 'b-2', 'Big booking');

      expect(loyaltyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ points: 1000 }),
      );
    });
  });

  describe('deductPoints', () => {
    it('should deduct points when user has sufficient balance', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 1000 } as any);

      const result = await service.deductPoints('user-1', 500, 'booking-1', 'Redeemed');

      expect(loyaltyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          points: -500,
          type: LoyaltyTransactionType.REDEEMED,
        }),
      );
      expect(usersService.updateLoyaltyPoints).toHaveBeenCalledWith('user-1', -500);
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException when insufficient points', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 100 } as any);

      await expect(
        service.deductPoints('user-1', 500, 'b1', 'Redeem'),
      ).rejects.toThrow(BadRequestException);

      expect(loyaltyRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(
        service.deductPoints('unknown', 500, 'b1', 'Redeem'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when trying to deduct more than available', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 499 } as any);

      await expect(
        service.deductPoints('user-1', 500, 'b1', 'Over budget'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('redeemPoints', () => {
    it('should delegate to deductPoints with empty bookingId', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 1000 } as any);

      await service.redeemPoints('user-1', 200, 'Reward redemption');

      expect(loyaltyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          bookingId: '',
          points: -200,
          type: LoyaltyTransactionType.REDEEMED,
        }),
      );
    });
  });

  describe('addBonus', () => {
    it('should create BONUS transaction and add points', async () => {
      const result = await service.addBonus('user-1', 100, 'Welcome bonus');

      expect(loyaltyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          points: 100,
          type: LoyaltyTransactionType.BONUS,
          description: 'Welcome bonus',
        }),
      );
      expect(usersService.updateLoyaltyPoints).toHaveBeenCalledWith('user-1', 100);
      expect(result).toHaveProperty('id');
    });
  });

  describe('getHistory', () => {
    it('should return paginated transaction history', async () => {
      loyaltyRepo.findAndCount!.mockResolvedValue(
        [[mockTransaction as LoyaltyTransaction], 1],
      );

      const result = await service.getHistory('user-1', 1, 20);

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(loyaltyRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination offset correctly', async () => {
      loyaltyRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.getHistory('user-1', 3, 10);

      expect(loyaltyRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should return empty array when no transactions exist', async () => {
      loyaltyRepo.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.getHistory('user-1');

      expect(result.transactions).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('should return user loyalty points', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 750 } as any);

      const balance = await service.getBalance('user-1');

      expect(balance).toBe(750);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return 0 when user not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      const balance = await service.getBalance('unknown-user');

      expect(balance).toBe(0);
    });

    it('should return 0 when user has no points', async () => {
      usersService.findById!.mockResolvedValue({ ...mockUser, loyaltyPoints: 0 } as any);

      const balance = await service.getBalance('user-1');

      expect(balance).toBe(0);
    });
  });
});
