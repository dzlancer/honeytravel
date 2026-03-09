import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, Index,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

@Entity('payments')
@Index(['stripePaymentIntentId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  bookingId: string;

  @OneToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column('uuid')
  userId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'text', default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'text', default: PaymentMethod.CARD })
  method: PaymentMethod;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, string>;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
