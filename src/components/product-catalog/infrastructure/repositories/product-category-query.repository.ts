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
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
    page?: number,
    size?: number,
  ): Promise<ProductCategory[]> {
    const queryBuilder = this.repository.createQueryBuilder('pc');

    // Filter by tenant
    queryBuilder.where('pc.tenant_id = :tenantId', { tenantId });

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
        ancestorParams[`ancestor${index}`] = ancestorId;
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
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
  ): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('pc');

    // Filter by tenant
    queryBuilder.where('pc.tenant_id = :tenantId', { tenantId });

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
        ancestorParams[`ancestor${index}`] = ancestorId;
      });

      queryBuilder.andWhere(`(${ancestorConditions.join(' OR ')})`, ancestorParams);
    }

    return await queryBuilder.getCount();
  }

  private toDomain(model: ProductCategoryModel): ProductCategory {
    return new ProductCategory(
      Number(model.id),
      new ProductCategoryNameVO(model.name),
      Number(model.tenant_id),
      model.product_category_parent_id ? Number(model.product_category_parent_id) : null,
      Number(model.level),
      model.parent_level1_id ? Number(model.parent_level1_id) : null,
      model.parent_level2_id ? Number(model.parent_level2_id) : null,
      Number(model.active_status),
      model.creator_id ? Number(model.creator_id) : null,
    );
  }
}
