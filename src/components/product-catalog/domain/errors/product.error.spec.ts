// src/components/product-catalog/domain/errors/product.error.spec.ts
import { ProductNotFoundError } from './product.error';

describe('ProductNotFoundError', () => {
  describe('AC_DOMAIN_03_01: ProductNotFoundError creation', () => {
    it('[PASS] should create error with productCode', () => {
      // Act
      const error = new ProductNotFoundError('PROD-001');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ProductNotFoundError');
      expect(error.message).toBe('Product with code "PROD-001" not found');
      expect(error.productCode).toBe('PROD-001');
    });

    it('[PASS] should be throwable and catchable', () => {
      // Arrange
      const throwError = () => {
        throw new ProductNotFoundError('PROD-999');
      };

      // Act & Assert
      expect(throwError).toThrow(ProductNotFoundError);
      expect(throwError).toThrow('Product with code "PROD-999" not found');
    });
  });
});
