// src/components/product-catalog/application/repositories/product-category-query.repository.ts
import { ProductCategoryModel } from '../../infrastructure/entities/product-category.model';

/**
 * Query repository - chỉ query thuần túy
 * Trả về TypeORM models để handler xử lý mapping sang DTO response
 */
export interface IProductCategoryQueryRepository {
  findAll(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
    page?: number,
    size?: number,
  ): Promise<ProductCategoryModel[]>;

  count(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
  ): Promise<number>;
}
