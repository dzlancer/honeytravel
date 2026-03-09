import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  CANCELLED = 'cancelled',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: 'all' })
  targetAudience: string; // all, active, inactive, loyal

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  openRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  clickRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
