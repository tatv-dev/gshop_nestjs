// src/components/product-catalog/infrastructure/repositories/product-query.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductModel } from '../entities/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductCodeVO } from '../../domain/value-objects/product-code.vo';

/**
 * Product Query Repository Implementation (Adapter)
 * Infrastructure layer - implements the repository interface
 */
@Injectable()
export class ProductQueryRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductModel)
    private readonly productRepository: Repository<ProductModel>,
  ) {}

  /**
   * Find product by code and tenantId
   * Uses JOIN to fetch category name in single query
   */
  async findByCode(
    productCode: string,
    tenantId: number,
  ): Promise<Product | null> {
    // Query with JOIN to get category name
    const productModel = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.product_code = :productCode', { productCode })
      .andWhere('product.tenant_id = :tenantId', { tenantId })
      .getOne();

    // If not found, return null
    if (!productModel) {
      return null;
    }

    // Map to domain entity
    return this.toDomainEntity(productModel);
  }

  /**
   * Map ProductModel (ORM) to Product (Domain Entity)
   */
  private toDomainEntity(model: ProductModel): Product {
    return Product.create({
      id: model.id,
      productCode: ProductCodeVO.create(model.product_code),
      productName: model.product_name,
      description: model.description || '',
      price: Number(model.price),
      unit: model.unit,
      categoryId: model.category_id,
      categoryName: model.category?.name || '',
      tenantId: model.tenant_id,
      activeStatus: model.active_status,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
    });
  }
}
