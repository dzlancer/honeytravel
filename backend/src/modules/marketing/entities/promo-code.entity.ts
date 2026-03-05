import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', default: 'percentage' })
  discountType: 'percentage' | 'fixed';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountValue: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minBookingAmount: number;

  @Column({ default: 100 })
  maxUses: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ type: 'timestamptz' })
  validFrom: Date;

  @Column({ type: 'timestamptz' })
  validUntil: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
