// src/components/product-catalog/infrastructure/entities/product-category.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('product_categories')
@Index('idx_tenant_id', ['tenant_id'])
@Index('idx_active_status', ['active_status'])
@Index('idx_parent_level1', ['parent_level1_id'])
@Index('idx_parent_level2', ['parent_level2_id'])
@Index('idx_product_category_parent_id', ['product_category_parent_id'])
export class ProductCategoryModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'bigint', unsigned: true })
  tenant_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  product_category_parent_id: number | null;

  @Column({ type: 'tinyint', unsigned: true })
  level: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_level1_id: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_level2_id: number | null;

  @Column({ type: 'tinyint', default: 1 })
  active_status: number;

  @Column({ type: 'bigint', unsigned: true })
  creator_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
