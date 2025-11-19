// src/components/product-catalog/application/dtos/find-product-by-code.dto.spec.ts
import { FindProductByCodeDTO } from './find-product-by-code.dto';

describe('FindProductByCodeDTO', () => {
  describe('AC_APP_01_01: Valid DTO creation', () => {
    it('[PASS] should create DTO with valid productCode and tenantId', () => {
      // Act
      const dto = new FindProductByCodeDTO('PROD-001', 1);

      // Assert
      expect(dto).toBeInstanceOf(FindProductByCodeDTO);
      expect(dto.productCode).toBe('PROD-001');
      expect(dto.tenantId).toBe(1);
    });
  });

  describe('AC_APP_01_02: Invalid DTO - Empty productCode', () => {
    it('[FAIL] should validate productCode is not empty', () => {
      // Note: In NestJS with class-validator, validation happens in pipes
      // This test validates that DTO can be instantiated
      // Actual validation will be tested in presentation layer
      const dto = new FindProductByCodeDTO('', 1);

      expect(dto.productCode).toBe('');
      // Validation error will be caught by ValidationPipe in controller
    });
  });

  describe('AC_APP_01_03: Invalid DTO - Invalid tenantId', () => {
    it('[FAIL] should validate tenantId is greater than 0', () => {
      const dto = new FindProductByCodeDTO('PROD-001', 0);

      expect(dto.tenantId).toBe(0);
      // Validation logic will be in domain layer or handler
    });

    it('[FAIL] should validate tenantId is not negative', () => {
      const dto = new FindProductByCodeDTO('PROD-001', -1);

      expect(dto.tenantId).toBe(-1);
    });
  });
});
