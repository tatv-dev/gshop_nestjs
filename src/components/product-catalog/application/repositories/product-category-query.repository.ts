// src/components/product-catalog/application/repositories/product-category-query.repository.ts
import { ProductCategory } from '../../domain/entities/product-category.entity';

export interface IProductCategoryQueryRepository {
  findAll(
    tenantId: string,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: string[],
    page?: number,
    size?: number,
  ): Promise<ProductCategory[]>;

  count(
    tenantId: string,
    productCategoryName?: string,
    activeStatuses?: number[],
    productCategoryAncestors?: string[],
  ): Promise<number>;
}
