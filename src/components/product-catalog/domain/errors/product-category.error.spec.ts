// src/components/product-catalog/domain/errors/product-category.error.spec.ts
import { ProductCategoryNotFoundError } from './product-category.error';

describe('ProductCategory Domain Errors', () => {
  describe('ProductCategoryNotFoundError', () => {
    it('should create error with default message', () => {
      const error = new ProductCategoryNotFoundError();
      expect(error.message).toBe('Product category not found');
      expect(error.name).toBe('ProductCategoryNotFoundError');
    });

    it('should create error with custom message', () => {
      const customMessage = 'Product category with ID 123 not found';
      const error = new ProductCategoryNotFoundError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });
});
