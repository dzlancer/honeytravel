import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async sendEmail(userId: string, subject: string, body: string, event?: string) {
    const notification = this.notificationRepo.create({
      userId,
      type: NotificationType.EMAIL,
      subject,
      body,
      event,
      status: NotificationStatus.PENDING,
    });
    const saved = await this.notificationRepo.save(notification);

    await this.notificationQueue.add('send-email', {
      notificationId: saved.id,
      userId,
      subject,
      body,
    });

    return saved;
  }

  async sendPush(userId: string, title: string, body: string, event?: string) {
    const notification = this.notificationRepo.create({
      userId,
      type: NotificationType.PUSH,
      subject: title,
      body,
      event,
      status: NotificationStatus.PENDING,
    });
    const saved = await this.notificationRepo.save(notification);

    await this.notificationQueue.add('send-push', {
      notificationId: saved.id,
      userId,
      title,
      body,
    });

    return saved;
  }

  async markSent(id: string) {
    await this.notificationRepo.update(id, { status: NotificationStatus.SENT });
  }

  async markFailed(id: string) {
    await this.notificationRepo.update(id, { status: NotificationStatus.FAILED });
  }

  async getByUserId(userId: string, limit = 20) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByUserPaginated(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.getUnreadCount(userId);
    return { notifications, total, page, limit, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.update(
      { id, userId },
      { readAt: new Date() },
    );
    return this.notificationRepo.findOne({ where: { id } });
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo
      .createQueryBuilder()
      .update()
      .set({ readAt: new Date() })
      .where('userId = :userId AND readAt IS NULL', { userId })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, readAt: IsNull() },
    });
  }
}
