import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed_password',
    role: 'customer',
    loyaltyPoints: 100,
    refreshToken: 'old-refresh-token',
    passwordResetToken: null as string | null,
    passwordResetExpires: null as Date | null,
    isEmailVerified: false,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByResetToken: jest.fn(),
      create: jest.fn(),
      updateProfile: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: string) => {
        const map: Record<string, string> = {
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        };
        return map[key] || defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user and return tokens', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersService.create!.mockResolvedValue(mockUser as any);
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBe('user-1');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          passwordHash: 'hashed_password',
        }),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    });

    it('should throw ConflictException for duplicate email', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should include phone when provided', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      usersService.create!.mockResolvedValue(mockUser as any);
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      await service.register({ ...registerDto, phone: '+213555123456' });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+213555123456' }),
      );
    });

    it('should store hashed password alongside original dto fields', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');
      usersService.create!.mockResolvedValue(mockUser as any);
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      await service.register(registerDto);

      // The service spreads the dto and adds passwordHash
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: '$2b$12$hashed' }),
      );
      // Verify bcrypt hash was called with correct cost factor
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });
  });

  describe('login', () => {
    it('should login with valid credentials and return tokens', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      const result = await service.login('test@example.com', 'Password123!');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('John');
      expect(result.user.loyaltyPoints).toBe(100);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-1', 'mock-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for nonexistent user', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(service.login('nobody@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and update profile when user exists', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      usersService.updateProfile!.mockResolvedValue(mockUser as any);

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toBe('If an account exists, a reset link has been sent.');
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          passwordResetToken: expect.any(String),
          passwordResetExpires: expect.any(Date),
        }),
      );
    });

    it('should return same message when user does not exist (prevents enumeration)', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      const result = await service.forgotPassword('nobody@example.com');

      expect(result.message).toBe('If an account exists, a reset link has been sent.');
      expect(usersService.updateProfile).not.toHaveBeenCalled();
    });

    it('should set reset token expiry ~1 hour in the future', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      usersService.updateProfile!.mockResolvedValue(mockUser as any);

      const before = Date.now();
      await service.forgotPassword('test@example.com');
      const after = Date.now();

      const callArgs = usersService.updateProfile!.mock.calls[0][1] as any;
      const expires = callArgs.passwordResetExpires.getTime();
      // The expiry should be approximately 1 hour from now
      expect(expires).toBeGreaterThanOrEqual(before + 3600000 - 1000);
      expect(expires).toBeLessThanOrEqual(after + 3600000 + 1000);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const userWithToken = {
        ...mockUser,
        passwordResetToken: 'valid-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };
      usersService.findByResetToken!.mockResolvedValue(userWithToken as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      usersService.updateProfile!.mockResolvedValue(userWithToken as any);

      const result = await service.resetPassword('valid-token', 'NewPass123!');

      expect(result.message).toBe('Password has been reset successfully');
      expect(usersService.findByResetToken).toHaveBeenCalledWith('valid-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123!', 12);
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ passwordHash: 'new_hash' }),
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      usersService.findByResetToken!.mockResolvedValue(null);

      await expect(service.resetPassword('invalid', 'Pass1!')).rejects.toThrow(
        BadRequestException,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired token', async () => {
      const userWithExpired = {
        ...mockUser,
        passwordResetToken: 'expired',
        passwordResetExpires: new Date(Date.now() - 3600000),
      };
      usersService.findByResetToken!.mockResolvedValue(userWithExpired as any);

      await expect(service.resetPassword('expired', 'Pass1!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when passwordResetExpires is null', async () => {
      const userNoExpiry = {
        ...mockUser,
        passwordResetToken: 'tok',
        passwordResetExpires: null,
      };
      usersService.findByResetToken!.mockResolvedValue(userNoExpiry as any);

      await expect(service.resetPassword('tok', 'Pass1!')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid JWT token', async () => {
      jwtService.verify!.mockReturnValue({ sub: 'user-1' });
      usersService.updateProfile!.mockResolvedValue(mockUser as any);

      const result = await service.verifyEmail('valid-jwt-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
        isEmailVerified: true,
      });
      expect(result.message).toBe('Email verified successfully');
    });

    it('should throw BadRequestException for invalid verification token', async () => {
      jwtService.verify!.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
      expect(usersService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens for valid refresh token', async () => {
      jwtService.verify!.mockReturnValue({ sub: 'user-1', email: 'test@example.com', role: 'customer' });
      usersService.findById!.mockResolvedValue({ ...mockUser, refreshToken: 'valid-refresh' } as any);
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      const result = await service.refreshTokens('valid-refresh');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh', { secret: 'refresh-secret' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
    });

    it('should throw UnauthorizedException when refresh token does not match stored token', async () => {
      jwtService.verify!.mockReturnValue({ sub: 'user-1' });
      usersService.findById!.mockResolvedValue({ ...mockUser, refreshToken: 'different-stored' } as any);

      await expect(service.refreshTokens('not-matching-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verify!.mockReturnValue({ sub: 'user-1' });
      usersService.findById!.mockResolvedValue(null);

      await expect(service.refreshTokens('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid JWT', async () => {
      jwtService.verify!.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshTokens('bad')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear the refresh token', async () => {
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      await service.logout('user-1');

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-1', null);
    });
  });
});
