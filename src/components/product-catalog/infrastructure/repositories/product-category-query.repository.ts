// src/components/product-catalog/infrastructure/repositories/product-category-query.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategoryModel } from '../entities/product-category.model';
import { IProductCategoryQueryRepository } from '../../application/repositories/product-category-query.repository';
import { ProductCategoryQueryResult } from '../../application/interfaces/product-category-query-result.interface';

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
  ): Promise<ProductCategoryQueryResult[]> {
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

    console.log('Fetched ProductCategoryModels:', JSON.stringify(models, null, 2));

    // Trả về raw data, không map to domain
    return models.map((model) => this.toQueryResult(model));
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

  /**
   * Convert model to plain query result
   * Không map to domain entity, chỉ trả về plain object
   */
  private toQueryResult(model: ProductCategoryModel): ProductCategoryQueryResult {
    return {
      id: Number(model.id),
      name: model.name,
      tenant_id: Number(model.tenant_id),
      product_category_parent_id: model.product_category_parent_id ? Number(model.product_category_parent_id) : null,
      level: Number(model.level),
      parent_level1_id: model.parent_level1_id ? Number(model.parent_level1_id) : null,
      parent_level2_id: model.parent_level2_id ? Number(model.parent_level2_id) : null,
      active_status: Number(model.active_status),
      creator_id: model.creator_id ? Number(model.creator_id) : null,
    };
  }
}
