// src/components/product-catalog/application/handlers/find-product-by-code.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindProductByCodeQuery } from '../queries/find-product-by-code.query';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductNotFoundError } from '../../domain/errors/product.error';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

/**
 * Find Product By Code Query Handler
 * Handles the query to find a product by its code
 */
@QueryHandler(FindProductByCodeQuery)
export class FindProductByCodeHandler
  implements IQueryHandler<FindProductByCodeQuery>
{
  constructor(
    @Inject('ProductRepository')
    private readonly repository: ProductRepository,
  ) {}

  async execute(query: FindProductByCodeQuery): Promise<any> {
    // Validate tenantId
    if (query.tenantId <= 0) {
      throw new DomainError('Tenant ID must be greater than 0');
    }

    // Find product by code
    const product = await this.repository.findByCode(
      query.productCode,
      query.tenantId,
    );

    // If not found, throw error
    if (!product) {
      throw new ProductNotFoundError(query.productCode);
    }

    // Return product data
    return product.toObject();
  }
}
