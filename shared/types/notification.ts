export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  subject: string;
  body: string;
  status: NotificationStatus;
  event?: string;
  metadata?: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}
