// src/components/product-catalog/application/interfaces/product-category-query-result.interface.ts

/**
 * Raw query result từ repository
 * Không phải domain entity, chỉ là plain data
 */
export interface ProductCategoryQueryResult {
  id: number;
  name: string;
  tenant_id: number;
  product_category_parent_id: number | null;
  level: number;
  parent_level1_id: number | null;
  parent_level2_id: number | null;
  active_status: number;
  creator_id: number | null;
}
