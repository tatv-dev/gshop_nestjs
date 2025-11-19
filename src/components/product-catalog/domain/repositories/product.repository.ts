// src/components/product-catalog/domain/repositories/product.repository.ts
import { Product } from '../entities/product.entity';

/**
 * Product Repository Interface (Port)
 * Defines contract for product data access
 */
export interface ProductRepository {
  /**
   * Find product by code and tenantId
   * @param productCode - Product code to search
   * @param tenantId - Tenant ID for isolation
   * @returns Product entity or null if not found
   */
  findByCode(productCode: string, tenantId: number): Promise<Product | null>;
}
