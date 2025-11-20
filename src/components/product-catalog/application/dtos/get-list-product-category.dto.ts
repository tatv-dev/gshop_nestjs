// src/components/product-catalog/application/dtos/get-list-product-category.dto.ts
export class GetListProductCategoryDTO {
  constructor(
    public readonly tenantId: number,
    public readonly productCategoryName?: string,
    public readonly activeStatuses?: number[],
    public readonly productCategoryAncestors?: number[],
    public readonly page?: number,
    public readonly size?: number,
  ) {}
}
