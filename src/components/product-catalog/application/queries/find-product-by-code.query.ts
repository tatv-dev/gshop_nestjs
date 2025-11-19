// src/components/product-catalog/application/queries/find-product-by-code.query.ts

/**
 * Find Product By Code Query
 * Query object for CQRS pattern
 */
export class FindProductByCodeQuery {
  constructor(
    public readonly productCode: string,
    public readonly tenantId: number,
  ) {}
}
