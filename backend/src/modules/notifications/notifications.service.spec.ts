import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: jest.Mocked<Partial<Repository<Notification>>>;
  let notificationQueue: { add: jest.Mock };

  const mockNotification: Partial<Notification> = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.EMAIL,
    subject: 'Test Subject',
    body: 'Test Body',
    status: NotificationStatus.PENDING,
    event: 'booking.created',
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    notificationRepo = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'notif-1', ...dto })),
      save: jest.fn().mockImplementation((n) => Promise.resolve(n)),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      }),
    };
    notificationQueue = { add: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getQueueToken('notifications'), useValue: notificationQueue },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should create email notification and queue it', async () => {
      const result = await service.sendEmail('user-1', 'Welcome', 'Welcome body', 'user.registered');

      expect(result).toHaveProperty('id', 'notif-1');
      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.EMAIL,
          subject: 'Welcome',
          body: 'Welcome body',
          event: 'user.registered',
          status: NotificationStatus.PENDING,
        }),
      );
      expect(notificationRepo.save).toHaveBeenCalled();
      expect(notificationQueue.add).toHaveBeenCalledWith('send-email', {
        notificationId: 'notif-1',
        userId: 'user-1',
        subject: 'Welcome',
        body: 'Welcome body',
      });
    });

    it('should work without event parameter', async () => {
      await service.sendEmail('user-1', 'Subject', 'Body');

      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event: undefined,
        }),
      );
    });
  });

  describe('sendPush', () => {
    it('should create push notification and queue it', async () => {
      const result = await service.sendPush('user-1', 'Booking Update', 'Your booking is confirmed');

      expect(result).toHaveProperty('id');
      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.PUSH,
          subject: 'Booking Update',
          body: 'Your booking is confirmed',
          status: NotificationStatus.PENDING,
        }),
      );
      expect(notificationQueue.add).toHaveBeenCalledWith('send-push', {
        notificationId: 'notif-1',
        userId: 'user-1',
        title: 'Booking Update',
        body: 'Your booking is confirmed',
      });
    });
  });

  describe('markSent', () => {
    it('should update notification status to SENT', async () => {
      await service.markSent('notif-1');

      expect(notificationRepo.update).toHaveBeenCalledWith('notif-1', {
        status: NotificationStatus.SENT,
      });
    });
  });

  describe('markFailed', () => {
    it('should update notification status to FAILED', async () => {
      await service.markFailed('notif-1');

      expect(notificationRepo.update).toHaveBeenCalledWith('notif-1', {
        status: NotificationStatus.FAILED,
      });
    });
  });

  describe('getByUserId', () => {
    it('should return notifications for a user', async () => {
      notificationRepo.find!.mockResolvedValue([mockNotification as Notification]);

      const result = await service.getByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 20,
      });
    });

    it('should respect custom limit', async () => {
      notificationRepo.find!.mockResolvedValue([]);

      await service.getByUserId('user-1', 5);

      expect(notificationRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('findByUserPaginated', () => {
    it('should return paginated notifications with unread count', async () => {
      notificationRepo.findAndCount!.mockResolvedValue(
        [[mockNotification as Notification], 1],
      );
      notificationRepo.count!.mockResolvedValue(3);

      const result = await service.findByUserPaginated('user-1', 1, 20);

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.unreadCount).toBe(3);
    });

    it('should calculate correct offset for page 2', async () => {
      notificationRepo.findAndCount!.mockResolvedValue([[], 0]);
      notificationRepo.count!.mockResolvedValue(0);

      await service.findByUserPaginated('user-1', 2, 10);

      expect(notificationRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should set readAt timestamp and return updated notification', async () => {
      notificationRepo.findOne!.mockResolvedValue({
        ...mockNotification,
        readAt: new Date(),
      } as Notification);

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(notificationRepo.update).toHaveBeenCalledWith(
        { id: 'notif-1', userId: 'user-1' },
        { readAt: expect.any(Date) },
      );
      expect(result).toBeDefined();
    });

    it('should scope update to the correct user', async () => {
      notificationRepo.findOne!.mockResolvedValue(mockNotification as Notification);

      await service.markAsRead('notif-1', 'user-1');

      // Verify the update uses both id and userId for scoping
      expect(notificationRepo.update).toHaveBeenCalledWith(
        { id: 'notif-1', userId: 'user-1' },
        expect.any(Object),
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for the user', async () => {
      await service.markAllAsRead('user-1');

      expect(notificationRepo.createQueryBuilder).toHaveBeenCalled();
      const qb = notificationRepo.createQueryBuilder!.mock.results[0].value;
      expect(qb.update).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'userId = :userId AND readAt IS NULL',
        { userId: 'user-1' },
      );
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      notificationRepo.count!.mockResolvedValue(5);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(5);
      expect(notificationRepo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: expect.anything() },
      });
    });

    it('should return 0 when all are read', async () => {
      notificationRepo.count!.mockResolvedValue(0);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(0);
    });
  });
});
