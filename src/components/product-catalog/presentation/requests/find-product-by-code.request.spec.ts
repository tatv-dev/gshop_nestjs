// src/components/product-catalog/presentation/requests/find-product-by-code.request.spec.ts
import { validate } from 'class-validator';
import { FindProductByCodeRequest } from './find-product-by-code.request';

describe('FindProductByCodeRequest Validation', () => {
  describe('AC_PRES_01_01: Valid request', () => {
    it('[PASS] should pass validation with valid productCode', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      // Act
      const errors = await validate(request);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('[PASS] should pass validation with alphanumeric and special chars', async () => {
      const validCodes = [
        'PROD-001',
        'PROD_001',
        'Product123',
        'SKU-ABC-123',
      ];

      for (const code of validCodes) {
        const request = new FindProductByCodeRequest();
        request.productCode = code;

        const errors = await validate(request);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('AC_PRES_01_02: Invalid request - Empty productCode', () => {
    it('[FAIL] should fail validation when productCode is empty', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = '';

      // Act
      const errors = await validate(request);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const productCodeError = errors.find((e) => e.property === 'productCode');
      expect(productCodeError).toBeDefined();
      expect(productCodeError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('[FAIL] should fail validation when productCode is undefined', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      // productCode not set

      // Act
      const errors = await validate(request);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const productCodeError = errors.find((e) => e.property === 'productCode');
      expect(productCodeError).toBeDefined();
    });
  });

  describe('AC_PRES_01_03: Invalid request - Length violation', () => {
    it('[FAIL] should fail validation when productCode > 50 characters', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'A'.repeat(51);

      // Act
      const errors = await validate(request);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const productCodeError = errors.find((e) => e.property === 'productCode');
      expect(productCodeError).toBeDefined();
      expect(productCodeError?.constraints).toHaveProperty('maxLength');
    });
  });

  describe('AC_PRES_01_04: Invalid request - Invalid characters', () => {
    it('[FAIL] should fail validation with invalid special characters', async () => {
      const invalidCodes = [
        'PROD@001',  // @ not allowed
        'PROD#001',  // # not allowed
        'PROD 001',  // space not allowed
        'PROD!001',  // ! not allowed
        'PROD%001',  // % not allowed
      ];

      for (const code of invalidCodes) {
        const request = new FindProductByCodeRequest();
        request.productCode = code;

        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);

        const productCodeError = errors.find(
          (e) => e.property === 'productCode',
        );
        expect(productCodeError).toBeDefined();
        expect(productCodeError?.constraints).toHaveProperty('matches');
      }
    });
  });
});
