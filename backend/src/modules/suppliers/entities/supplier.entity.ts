import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  type: string; // hotel, flight, car_rental, package

  @Column()
  baseUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text' })
  encryptedCredentials: string; // AES-256-GCM encrypted JSON

  @Column({ default: 100 })
  rateLimit: number; // requests per minute

  @Column({ default: 30000 })
  timeout: number; // ms

  @Column({ default: 0 })
  priority: number; // higher = preferred

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
