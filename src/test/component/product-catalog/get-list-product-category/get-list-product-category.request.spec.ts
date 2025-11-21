import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { TestDataFactory } from '../test-helpers/test-data.factory';
// RED CODE: Class does not exist yet
import { GetListProductCategoryRequest } from '../../../../components/product-catalog/presentation/requests/get-list-product-category.request';

/**
 * Layer: Presentation
 * Type: Unit Test (Validation Logic)
 * Focus: Validating input constraints (types, length, patterns) using class-validator
 */
describe('GetListProductCategoryRequest Validation', () => {
  const testCases = TestDataFactory.getValidationTestCases();

  test.each(testCases)('[$acId] $title', async ({ acId, input, expected }) => {
    // Arrange
    const requestDto = plainToInstance(GetListProductCategoryRequest, input);

    // Act
    const errors: ValidationError[] = await validate(requestDto);

    // Assert
    if (expected.valid) {
      expect(errors).toHaveLength(0);
      
      // Check sanitization if applicable (e.g., trim)
      if (input.productCategoryName && typeof input.productCategoryName === 'string') {
         expect(requestDto.productCategoryName).toBe(input.productCategoryName.trim());
      }
    } else {
      expect(errors.length).toBeGreaterThan(0);
      const error = errors.find(e => e.property === expected.field);
      expect(error).toBeDefined();
      
      // We check if constraints exist, not exact message text
      const constraints = error?.constraints || {};
      expect(Object.keys(constraints).length).toBeGreaterThan(0);
    }
  });
});