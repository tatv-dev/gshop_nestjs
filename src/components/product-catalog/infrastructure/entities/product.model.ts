// src/components/product-catalog/infrastructure/entities/product.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCategoryModel } from './product-category.model';

@Entity('products')
export class ProductModel {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  product_code: string;

  @Column({ type: 'varchar', length: 200 })
  product_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 20, default: 'pcs' })
  unit: string;

  @Column({ type: 'bigint', unsigned: true })
  category_id: number;

  @Column({ type: 'bigint', unsigned: true })
  tenant_id: number;

  @Column({ type: 'int', default: 1 })
  active_status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relation to category (optional for JOIN queries)
  @ManyToOne(() => ProductCategoryModel)
  @JoinColumn({ name: 'category_id' })
  category?: ProductCategoryModel;
}
