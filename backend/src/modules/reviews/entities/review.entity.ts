import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductType } from '../../bookings/entities/booking.entity';

@Entity('reviews')
@Index(['userId'])
@Index(['productType', 'productId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  productType: ProductType;

  @Column()
  productId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ default: 0 })
  helpfulCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
