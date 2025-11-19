import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserModel } from './user.model';
import { TenantModel } from './tenant.model';

@Entity('workspaces')
@Index('idx_user_id', ['user_id'])
@Index('idx_tenant_id', ['tenant_id'])
export class WorkspaceModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  tenant_id: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @ManyToOne(() => TenantModel)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantModel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
