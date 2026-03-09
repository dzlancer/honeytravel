import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('config_audit_logs')
export class ConfigAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityType: string; // 'system_config' | 'supplier'

  @Column()
  entityId: string; // config key or supplier ID

  @Column()
  action: string; // 'create' | 'update' | 'delete'

  @Column({ type: 'text', nullable: true })
  oldValue: string; // JSON snapshot

  @Column({ type: 'text', nullable: true })
  newValue: string; // JSON snapshot

  @Column({ type: 'varchar' })
  userId: string;

  @Column()
  userEmail: string; // denormalized for display

  @CreateDateColumn()
  createdAt: Date;
}
