import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private notificationsService: NotificationsService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<{ notificationId: string; userId: string; subject: string; body: string }>) {
    const { notificationId, subject } = job.data;
    try {
      // In production, integrate with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({ to, from, subject, html: body });
      this.logger.log(`Email sent: ${subject} (notification: ${notificationId})`);
      await this.notificationsService.markSent(notificationId);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      await this.notificationsService.markFailed(notificationId);
    }
  }

  @Process('send-push')
  async handleSendPush(job: Job<{ notificationId: string; userId: string; title: string; body: string }>) {
    const { notificationId, title } = job.data;
    try {
      // In production, integrate with Firebase/APNS:
      // await admin.messaging().send({ token, notification: { title, body } });
      this.logger.log(`Push notification sent: ${title} (notification: ${notificationId})`);
      await this.notificationsService.markSent(notificationId);
    } catch (error) {
      this.logger.error(`Failed to send push: ${error}`);
      await this.notificationsService.markFailed(notificationId);
    }
  }
}
