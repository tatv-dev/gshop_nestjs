// src/components/product-catalog/application/repositories/product-category-query.repository.ts
import { ProductCategoryQueryResult } from '../interfaces/product-category-query-result.interface';

/**
 * Query repository - chỉ query thuần túy, không map to domain
 * Trả về raw data (plain object) để handler xử lý mapping sang DTO
 */
export interface IProductCategoryQueryRepository {
  findAll(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
    page?: number,
    size?: number,
  ): Promise<ProductCategoryQueryResult[]>;

  count(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
  ): Promise<number>;
}
