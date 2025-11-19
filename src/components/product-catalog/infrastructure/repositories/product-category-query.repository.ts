// src/components/product-catalog/infrastructure/repositories/product-category-query.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategoryModel } from '../entities/product-category.model';
import { IProductCategoryQueryRepository } from '../../application/repositories/product-category-query.repository';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { ProductCategoryNameVO } from '../../domain/value-objects/product-category-name.vo';

@Injectable()
export class ProductCategoryQueryRepository implements IProductCategoryQueryRepository {
  constructor(
    @InjectRepository(ProductCategoryModel)
    private readonly repository: Repository<ProductCategoryModel>,
  ) {}

  async findAll(
    tenantId: string,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: string[],
    page?: number,
    size?: number,
  ): Promise<ProductCategory[]> {
    const queryBuilder = this.repository.createQueryBuilder('pc');

    // Filter by tenant
    queryBuilder.where('pc.tenant_id = :tenantId', { tenantId: parseInt(tenantId) });

    // Filter by name (search)
    if (productCategoryName) {
      queryBuilder.andWhere('pc.name LIKE :name', {
        name: `%${productCategoryName}%`,
      });
    }

    // Filter by active statuses
    if (activeStatuses && activeStatuses.length > 0) {
      queryBuilder.andWhere('pc.active_status IN (:...activeStatuses)', { activeStatuses });
    }

    // Filter by ancestors
    if (productCategoryAncestors && productCategoryAncestors.length > 0) {
      const ancestorConditions = productCategoryAncestors.map((ancestorId, index) => {
        return `(pc.parent_level1_id = :ancestor${index} OR pc.parent_level2_id = :ancestor${index})`;
      });

      const ancestorParams: Record<string, number> = {};
      productCategoryAncestors.forEach((ancestorId, index) => {
        ancestorParams[`ancestor${index}`] = parseInt(ancestorId);
      });

      queryBuilder.andWhere(`(${ancestorConditions.join(' OR ')})`, ancestorParams);
    }

    // Apply pagination
    if (page && size) {
      const skip = (page - 1) * size;
      queryBuilder.skip(skip).take(size);
    }

    // Order by id
    queryBuilder.orderBy('pc.id', 'ASC');

    const models = await queryBuilder.getMany();

    return models.map((model) => this.toDomain(model));
  }

  async count(
    tenantId: string,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: string[],
  ): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('pc');

    // Filter by tenant
    queryBuilder.where('pc.tenant_id = :tenantId', { tenantId: parseInt(tenantId) });

    // Filter by name (search)
    if (productCategoryName) {
      queryBuilder.andWhere('pc.name LIKE :name', {
        name: `%${productCategoryName}%`,
      });
    }

    // Filter by active statuses
    if (activeStatuses && activeStatuses.length > 0) {
      queryBuilder.andWhere('pc.active_status IN (:...activeStatuses)', { activeStatuses });
    }

    // Filter by ancestors
    if (productCategoryAncestors && productCategoryAncestors.length > 0) {
      const ancestorConditions = productCategoryAncestors.map((ancestorId, index) => {
        return `(pc.parent_level1_id = :ancestor${index} OR pc.parent_level2_id = :ancestor${index})`;
      });

      const ancestorParams: Record<string, number> = {};
      productCategoryAncestors.forEach((ancestorId, index) => {
        ancestorParams[`ancestor${index}`] = parseInt(ancestorId);
      });

      queryBuilder.andWhere(`(${ancestorConditions.join(' OR ')})`, ancestorParams);
    }

    return await queryBuilder.getCount();
  }

  private toDomain(model: ProductCategoryModel): ProductCategory {
    return new ProductCategory(
      model.id.toString(),
      new ProductCategoryNameVO(model.name),
      model.tenant_id.toString(),
      model.product_category_parent_id ? model.product_category_parent_id.toString() : null,
      model.level,
      model.parent_level1_id ? model.parent_level1_id.toString() : null,
      model.parent_level2_id ? model.parent_level2_id.toString() : null,
      model.active_status,
      model.creator_id.toString(),
    );
  }
}
