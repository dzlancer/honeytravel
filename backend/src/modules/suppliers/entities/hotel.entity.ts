import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity('hotels')
@Index(['supplierId', 'supplierHotelId'], { unique: true })
@Index(['city', 'country'])
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supplierId: string;

  @Column()
  supplierHotelId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'smallint', default: 3 })
  starRating: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng: number;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'jsonb', default: [] })
  amenities: string[];

  @Column({ type: 'jsonb', default: [] })
  rooms: {
    id: string;
    name: string;
    description: string;
    maxOccupancy: number;
    bedType: string;
    amenities: string[];
    images: string[];
    pricePerNight: number;
    currency: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    childPolicy?: string;
    petPolicy?: string;
  };

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  avgRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
