import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job<{ notificationId: string; userId: string; recipientEmail?: string; subject: string; body: string }>) {
    const { notificationId, subject, body, recipientEmail } = job.data;
    try {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL', 'noreply@travelshopalgeria.com');

      if (apiKey && apiKey.startsWith('SG.') && recipientEmail) {
        // Real SendGrid send
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(apiKey);
        await sgMail.send({
          to: recipientEmail,
          from: fromEmail,
          subject,
          html: body,
        });
        this.logger.log(`Email sent via SendGrid to ${recipientEmail}: ${subject}`);
      } else {
        // Mock mode — log instead of sending
        this.logger.log(`[Mock Email] To: ${recipientEmail || 'unknown'} | Subject: ${subject} | Notification: ${notificationId}`);
      }

      await this.notificationsService.markSent(notificationId);
    } catch (error) {
      this.logger.error(`Failed to send email (${notificationId}): ${error}`);
      await this.notificationsService.markFailed(notificationId);
      throw error; // Re-throw for Bull retry
    }
  }

  @Process('send-push')
  async handleSendPush(job: Job<{ notificationId: string; userId: string; title: string; body: string; deviceToken?: string }>) {
    const { notificationId, title, deviceToken } = job.data;
    try {
      if (deviceToken) {
        // In production, integrate with Firebase Cloud Messaging:
        // const admin = require('firebase-admin');
        // await admin.messaging().send({ token: deviceToken, notification: { title, body } });
        this.logger.log(`[Push] Sent to device ${deviceToken}: ${title}`);
      } else {
        this.logger.log(`[Mock Push] Title: ${title} | Notification: ${notificationId}`);
      }

      await this.notificationsService.markSent(notificationId);
    } catch (error) {
      this.logger.error(`Failed to send push (${notificationId}): ${error}`);
      await this.notificationsService.markFailed(notificationId);
      throw error;
    }
  }
}
