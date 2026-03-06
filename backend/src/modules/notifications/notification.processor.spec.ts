import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './notification.processor';
import { NotificationsService } from './notifications.service';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let notificationsService: jest.Mocked<Partial<NotificationsService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(async () => {
    notificationsService = {
      markSent: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    configService = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: NotificationsService, useValue: notificationsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSendEmail', () => {
    it('should mark notification as sent in mock mode (no API key)', async () => {
      const job = {
        data: {
          notificationId: 'notif-1',
          userId: 'user-1',
          subject: 'Welcome',
          body: '<p>Hello</p>',
        },
      } as any;

      await processor.handleSendEmail(job);

      expect(notificationsService.markSent).toHaveBeenCalledWith('notif-1');
      expect(notificationsService.markFailed).not.toHaveBeenCalled();
    });

    it('should use mock mode when API key is not a valid SendGrid key', async () => {
      configService.get!.mockReturnValue('not-a-sendgrid-key');

      const job = {
        data: {
          notificationId: 'notif-2',
          userId: 'user-1',
          recipientEmail: 'user@example.com',
          subject: 'Test',
          body: 'Body',
        },
      } as any;

      await processor.handleSendEmail(job);

      expect(notificationsService.markSent).toHaveBeenCalledWith('notif-2');
    });

    it('should mark as failed and re-throw on error', async () => {
      notificationsService.markSent!.mockRejectedValue(new Error('DB error'));

      const job = {
        data: {
          notificationId: 'notif-3',
          userId: 'user-1',
          subject: 'Test',
          body: 'Body',
        },
      } as any;

      await expect(processor.handleSendEmail(job)).rejects.toThrow('DB error');
      expect(notificationsService.markFailed).toHaveBeenCalledWith('notif-3');
    });

    it('should handle job with recipientEmail in mock mode', async () => {
      const job = {
        data: {
          notificationId: 'notif-4',
          userId: 'user-1',
          recipientEmail: 'test@example.com',
          subject: 'Booking Confirmed',
          body: '<p>Your booking is confirmed</p>',
        },
      } as any;

      await processor.handleSendEmail(job);

      expect(notificationsService.markSent).toHaveBeenCalledWith('notif-4');
    });
  });

  describe('handleSendPush', () => {
    it('should mark notification as sent on success', async () => {
      const job = {
        data: {
          notificationId: 'notif-5',
          userId: 'user-1',
          title: 'Booking Update',
          body: 'Your booking has been confirmed',
        },
      } as any;

      await processor.handleSendPush(job);

      expect(notificationsService.markSent).toHaveBeenCalledWith('notif-5');
      expect(notificationsService.markFailed).not.toHaveBeenCalled();
    });

    it('should handle push with device token (mock)', async () => {
      const job = {
        data: {
          notificationId: 'notif-6',
          userId: 'user-1',
          title: 'Alert',
          body: 'Something happened',
          deviceToken: 'fcm-token-abc123',
        },
      } as any;

      await processor.handleSendPush(job);

      expect(notificationsService.markSent).toHaveBeenCalledWith('notif-6');
    });

    it('should mark as failed and re-throw on error', async () => {
      notificationsService.markSent!.mockRejectedValue(new Error('FCM error'));

      const job = {
        data: {
          notificationId: 'notif-7',
          userId: 'user-1',
          title: 'Alert',
          body: 'Test',
        },
      } as any;

      await expect(processor.handleSendPush(job)).rejects.toThrow('FCM error');
      expect(notificationsService.markFailed).toHaveBeenCalledWith('notif-7');
    });
  });
});
