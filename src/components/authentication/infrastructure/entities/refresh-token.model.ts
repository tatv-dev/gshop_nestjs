import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index('idx_token_hash', ['token_hash'], { unique: false })
@Index('idx_user_id', ['user_id'])
export class RefreshTokenModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  software_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  workspace_id: number | null;;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  tenant_id: number | null;;

  @Column({ type: 'varchar', length: 255, unique: true })
  token_hash: string;

  @Column({ type: 'tinyint', default: 0 })
  revoked: number;

  @Column({ type: 'bigint', unsigned: true })
  expires_at: number;

  @Column({ type: 'tinyint', default: 0 })
  require_update_permission: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}