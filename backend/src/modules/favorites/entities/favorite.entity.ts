import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductType } from '../../bookings/entities/booking.entity';

@Entity('favorites')
@Unique(['userId', 'productType', 'productId'])
@Index(['userId'])
export class Favorite {
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

  @CreateDateColumn()
  createdAt: Date;
}
