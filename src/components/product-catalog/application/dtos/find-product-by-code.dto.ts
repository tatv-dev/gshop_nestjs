// src/components/product-catalog/application/dtos/find-product-by-code.dto.ts

/**
 * Find Product By Code DTO (Application Layer)
 * Data Transfer Object for query input
 */
export class FindProductByCodeDTO {
  constructor(
    public readonly productCode: string,
    public readonly tenantId: number,
  ) {}
}
