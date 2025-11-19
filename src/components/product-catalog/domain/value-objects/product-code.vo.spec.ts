// src/components/product-catalog/domain/value-objects/product-code.vo.spec.ts
import { ProductCodeVO } from './product-code.vo';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

describe('ProductCodeVO', () => {
  describe('AC_DOMAIN_01_01: Valid ProductCode creation', () => {
    it('[PASS] should create ProductCode with valid code "PROD-001"', () => {
      // Arrange & Act
      const productCode = ProductCodeVO.create('PROD-001');

      // Assert
      expect(productCode).toBeInstanceOf(ProductCodeVO);
      expect(productCode.value).toBe('PROD-001');
    });

    it('[PASS] should create ProductCode with alphanumeric and valid special chars', () => {
      const validCodes = [
        'PROD_001',
        'PROD-001',
        'Product123',
        'SKU-ABC-123',
        'P1',
      ];

      validCodes.forEach((code) => {
        const productCode = ProductCodeVO.create(code);
        expect(productCode.value).toBe(code);
      });
    });
  });

  describe('AC_DOMAIN_01_02: Invalid ProductCode - Empty string', () => {
    it('[FAIL] should throw DomainError when code is empty string', () => {
      // Arrange & Act & Assert
      expect(() => ProductCodeVO.create('')).toThrow(DomainError);
      expect(() => ProductCodeVO.create('')).toThrow(
        'Product code cannot be empty',
      );
    });

    it('[FAIL] should throw DomainError when code is whitespace only', () => {
      expect(() => ProductCodeVO.create('   ')).toThrow(DomainError);
    });
  });

  describe('AC_DOMAIN_01_03: Invalid ProductCode - Length violation', () => {
    it('[FAIL] should throw DomainError when code length > 50 characters', () => {
      // Arrange
      const longCode = 'A'.repeat(51);

      // Act & Assert
      expect(() => ProductCodeVO.create(longCode)).toThrow(DomainError);
      expect(() => ProductCodeVO.create(longCode)).toThrow(
        'Product code must be between 1 and 50 characters',
      );
    });
  });

  describe('AC_DOMAIN_01_04: Invalid ProductCode - Invalid characters', () => {
    it('[FAIL] should throw DomainError with invalid special characters', () => {
      const invalidCodes = [
        'PROD@001',   // @ not allowed
        'PROD#001',   // # not allowed
        'PROD 001',   // space not allowed
        'PROD!001',   // ! not allowed
        'PROD%001',   // % not allowed
      ];

      invalidCodes.forEach((code) => {
        expect(() => ProductCodeVO.create(code)).toThrow(DomainError);
        expect(() => ProductCodeVO.create(code)).toThrow(
          'Product code can only contain letters, numbers, hyphens, and underscores',
        );
      });
    });
  });

  describe('AC_DOMAIN_01_05: ProductCode equality', () => {
    it('[PASS] should return true when comparing two equal ProductCodes', () => {
      // Arrange
      const code1 = ProductCodeVO.create('PROD-001');
      const code2 = ProductCodeVO.create('PROD-001');

      // Act
      const result = code1.equals(code2);

      // Assert
      expect(result).toBe(true);
    });

    it('[FAIL] should return false when comparing two different ProductCodes', () => {
      // Arrange
      const code1 = ProductCodeVO.create('PROD-001');
      const code2 = ProductCodeVO.create('PROD-002');

      // Act
      const result = code1.equals(code2);

      // Assert
      expect(result).toBe(false);
    });

    it('[PASS] should be case-sensitive in comparison', () => {
      // Arrange
      const code1 = ProductCodeVO.create('PROD-001');
      const code2 = ProductCodeVO.create('prod-001');

      // Act
      const result = code1.equals(code2);

      // Assert
      expect(result).toBe(false);
    });
  });
});
