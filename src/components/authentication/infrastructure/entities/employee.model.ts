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
import { WorkspaceModel } from './workspace.model';

@Entity('employees')
@Index('idx_workspace_id', ['workspace_id'])
@Index('idx_branch_id', ['branch_id'])
export class EmployeeModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'bigint', unsigned: true })
  workspace_id: number;

  @Column({ type: 'bigint', unsigned: true })
  branch_id: number;

  @Column({ type: 'int', default: 1 })
  status: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ type: 'int', default: 1 })
  gender: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  note: string;

  @Column({ type: 'int', default: 1 })
  type: number;

  @ManyToOne(() => WorkspaceModel)
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceModel;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
