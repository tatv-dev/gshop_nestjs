// src/components/product-catalog/infrastructure/entities/product-category.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_categories')
export class ProductCategoryModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'bigint', unsigned: true })
  tenant_id: number;

  @Column({ type: 'int', default: 1 })
  active_status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
