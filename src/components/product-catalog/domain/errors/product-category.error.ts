// src/components/product-catalog/domain/errors/product-category.error.ts
export class ProductCategoryNotFoundError extends Error {
  constructor(message: string = 'Product category not found') {
    super(message);
    this.name = 'ProductCategoryNotFoundError';
  }
}
