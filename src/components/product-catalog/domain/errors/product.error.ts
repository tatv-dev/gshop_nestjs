// src/components/product-catalog/domain/errors/product.error.ts

/**
 * ProductNotFoundError
 * Thrown when a product is not found by code
 */
export class ProductNotFoundError extends Error {
  readonly productCode: string;

  constructor(productCode: string) {
    super(`Product with code "${productCode}" not found`);
    this.name = 'ProductNotFoundError';
    this.productCode = productCode;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProductNotFoundError);
    }
  }
}
