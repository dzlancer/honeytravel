import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ProductType {
  HOTEL = 'hotel',
  FLIGHT = 'flight',
  ACTIVITY = 'activity',
  PACKAGE = 'package',
  CAR_RENTAL = 'car_rental',
  TOUR = 'tour',
}

@Entity('bookings')
@Index(['userId', 'status'])
@Index(['createdAt'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  productType: ProductType;

  @Column()
  productId: string;

  @Column()
  supplierId: string;

  @Column({ nullable: true })
  supplierBookingRef: string;

  @Column({ type: 'text', default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'date' })
  checkIn: string;

  @Column({ type: 'date' })
  checkOut: string;

  @Column({ default: 1 })
  guestCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 0 })
  loyaltyPointsUsed: number;

  @Column({ default: 0 })
  loyaltyPointsEarned: number;

  @Column({ nullable: true })
  promoCode: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'simple-json', nullable: true })
  guestDetails: { firstName: string; lastName: string; email?: string; phone?: string }[];

  @Column({ nullable: true })
  notes: string;

  @OneToOne(() => Payment, (payment) => payment.booking, { nullable: true })
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
