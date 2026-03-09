import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

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

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  type: NotificationType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ nullable: true })
  event: string; // booking.created, cart.abandoned, etc.

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
