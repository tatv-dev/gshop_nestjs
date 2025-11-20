// src/components/product-catalog/application/repositories/product-category-query.repository.ts
import { ProductCategory } from '../../domain/entities/product-category.entity';

export interface IProductCategoryQueryRepository {
  findAll(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
    page?: number,
    size?: number,
  ): Promise<ProductCategory[]>;

  count(
    tenantId: number,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: number[],
  ): Promise<number>;
}
