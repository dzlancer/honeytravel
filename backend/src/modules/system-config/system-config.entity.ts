import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  key: string;

  @Column({ type: 'text' })
  value: string; // JSON-encoded

  @Column({ default: 'string' })
  type: string; // boolean, string, number, json

  @Column({ default: 'global' })
  category: string; // feature_flags, global, currency

  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string; // userId
}
