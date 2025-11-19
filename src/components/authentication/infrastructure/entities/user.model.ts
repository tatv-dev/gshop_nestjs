import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index('idx_user_name', ['user_name'], { unique: true })
export class UserModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  user_name: string;

  @Column({ type: 'varchar', length: 200 })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number: string;

  @Column({ type: 'tinyint', default: 0, nullable: true })
  lock_counter: number;

  @Column({ type: 'int', nullable: true })
  auto_lock_time: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}