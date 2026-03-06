import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<Partial<Repository<User>>>;

  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: UserRole.CUSTOMER,
    loyaltyPoints: 500,
    isEmailVerified: true,
    refreshToken: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    usersRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((u) => Promise.resolve({ id: 'user-1', ...u })),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      increment: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const dto: Partial<User> = {
        email: 'new@example.com',
        passwordHash: 'hashed',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('new@example.com');
      expect(usersRepo.create).toHaveBeenCalledWith(dto);
      expect(usersRepo.save).toHaveBeenCalled();
    });

    it('should pass all fields to create', async () => {
      const dto: Partial<User> = {
        email: 'full@example.com',
        passwordHash: 'hash',
        firstName: 'A',
        lastName: 'B',
        phone: '+213555000000',
      };

      await service.create(dto);

      expect(usersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+213555000000' }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      usersRepo.findOne!.mockResolvedValue(mockUser as User);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when not found', async () => {
      usersRepo.findOne!.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      usersRepo.findOne!.mockResolvedValue(mockUser as User);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(usersRepo.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return null when not found', async () => {
      usersRepo.findOne!.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByResetToken', () => {
    it('should find user by password reset token', async () => {
      usersRepo.findOne!.mockResolvedValue(mockUser as User);

      const result = await service.findByResetToken('reset-token-abc');

      expect(result).toEqual(mockUser);
      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { passwordResetToken: 'reset-token-abc' },
      });
    });

    it('should return null for non-existent token', async () => {
      usersRepo.findOne!.mockResolvedValue(null);

      const result = await service.findByResetToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update the refresh token for a user', async () => {
      await service.updateRefreshToken('user-1', 'new-token');

      expect(usersRepo.update).toHaveBeenCalledWith('user-1', { refreshToken: 'new-token' });
    });

    it('should clear the refresh token when null is passed', async () => {
      await service.updateRefreshToken('user-1', null);

      expect(usersRepo.update).toHaveBeenCalledWith('user-1', { refreshToken: undefined });
    });
  });

  describe('updateProfile', () => {
    it('should update user fields and return updated user', async () => {
      usersRepo.findOne!.mockResolvedValue({ ...mockUser, firstName: 'Updated' } as User);

      const result = await service.updateProfile('user-1', { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
      expect(usersRepo.update).toHaveBeenCalledWith('user-1', { firstName: 'Updated' });
    });

    it('should throw NotFoundException when user not found after update', async () => {
      usersRepo.findOne!.mockResolvedValue(null);

      await expect(service.updateProfile('bad-id', { firstName: 'T' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow updating multiple fields at once', async () => {
      const updates = { firstName: 'New', lastName: 'Name', phone: '+213000000000' };
      usersRepo.findOne!.mockResolvedValue({ ...mockUser, ...updates } as User);

      const result = await service.updateProfile('user-1', updates);

      expect(usersRepo.update).toHaveBeenCalledWith('user-1', updates);
      expect(result.firstName).toBe('New');
    });
  });

  describe('updateLoyaltyPoints', () => {
    it('should increment loyalty points', async () => {
      await service.updateLoyaltyPoints('user-1', 100);

      expect(usersRepo.increment).toHaveBeenCalledWith(
        { id: 'user-1' },
        'loyaltyPoints',
        100,
      );
    });

    it('should decrement loyalty points with negative value', async () => {
      await service.updateLoyaltyPoints('user-1', -50);

      expect(usersRepo.increment).toHaveBeenCalledWith(
        { id: 'user-1' },
        'loyaltyPoints',
        -50,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      usersRepo.findAndCount!.mockResolvedValue([[mockUser as User], 1]);

      const result = await service.findAll(1, 20);

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(usersRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          order: { createdAt: 'DESC' },
        }),
      );
    });

    it('should calculate correct offset for page 3', async () => {
      usersRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findAll(3, 10);

      expect(usersRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });
});
