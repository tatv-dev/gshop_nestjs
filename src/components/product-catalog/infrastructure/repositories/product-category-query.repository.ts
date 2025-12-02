// src/components/product-catalog/infrastructure/repositories/product-category-query.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategoryModel } from '../entities/product-category.model';
import { IProductCategoryQueryRepository } from '../../application/repositories/product-category-query.repository';

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
  ): Promise<ProductCategoryModel[]> {
    const queryBuilder = this.repository.createQueryBuilder('pc');

    // Filter by tenant
    queryBuilder.where('pc.tenant_id = :tenantId', { tenantId });

    // Filter by name (search)
    if (productCategoryName) {
      const safeName = `%${productCategoryName.replace(/["']/g, '')}%`;
      queryBuilder.andWhere('pc.name LIKE :safeName', { safeName, });
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

    // Trả về models trực tiếp, handler sẽ xử lý mapping
    return models;
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
}
