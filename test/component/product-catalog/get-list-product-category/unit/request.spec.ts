// test/component/product-catalog/get-list-product-category/unit/request.spec.ts
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { GetListProductCategoryRequest } from '../../../../../src/components/product-catalog/presentation/requests/get-list-product-category.request';
import { GetListTestCase } from '../../test-helpers/test-data.factory';
import { assertValidationErrors, assertNoValidationErrors } from '../../test-helpers/assertions.helper';

/**
 * GetListProductCategoryRequest - Unit Test
 * Tests validation rules for Request DTO
 *
 * Layer: Presentation (Interface Layer)
 * Test Type: Unit Test
 * Mock Strategy: No mocks (testing validation logic only)
 */
describe('GetListProductCategoryRequest - Unit Test', () => {
  /**
   * Test Cases for Validation
   * Following data provider pattern from Laravel/PHPUnit
   *
   * Test Coverage:
   * - AC-01: Happy path - valid request
   * - AC-02 to AC-10: Validation errors
   * - AC-11 to AC-15: Boundary values
   * - AC-16 to AC-20: Invalid types
   * - AC-21 to AC-25: Edge cases
   */
  const testCases: GetListTestCase[] = [
    // ==================== HAPPY PATH - ALWAYS FIRST ====================
    {
      acId: 'AC-01',
      title: 'Valid request with all fields',
      input: {
        tenantId: 1,
        productCategoryName: 'Electronics',
        activeStatuses: [1],
        productCategoryAncestors: [1, 2],
        page: 1,
        size: 10,
      },
      expected: {
        valid: true,
      },
    },

    {
      acId: 'AC-02',
      title: 'Valid request with only required fields',
      input: {
        // tenantId is optional in Request DTO (extracted from JWT)
        page: 1,
        size: 10,
      },
      expected: {
        valid: true,
      },
    },

    // ==================== VALIDATION ERRORS ====================
    {
      acId: 'AC-03',
      title: 'Invalid page - string instead of number',
      input: {
        page: 'invalid',
        size: 10,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'page', constraint: 'isInt' },
        ],
      },
    },

    {
      acId: 'AC-04',
      title: 'Invalid size - string instead of number',
      input: {
        page: 1,
        size: 'invalid',
      },
      expected: {
        valid: false,
        errors: [
          { field: 'size', constraint: 'isInt' },
        ],
      },
    },

    {
      acId: 'AC-05',
      title: 'Invalid activeStatuses - not an array',
      input: {
        page: 1,
        size: 10,
        activeStatuses: 'invalid',
      },
      expected: {
        valid: false,
        errors: [
          { field: 'activeStatuses', constraint: 'isArray' },
        ],
      },
    },

    {
      acId: 'AC-06',
      title: 'Invalid activeStatuses - array with non-integer values',
      input: {
        page: 1,
        size: 10,
        activeStatuses: ['invalid', 'values'],
      },
      expected: {
        valid: false,
        errors: [
          { field: 'activeStatuses', constraint: 'isInt' },
        ],
      },
    },

    {
      acId: 'AC-07',
      title: 'Invalid productCategoryAncestors - not an array',
      input: {
        page: 1,
        size: 10,
        productCategoryAncestors: 'invalid',
      },
      expected: {
        valid: false,
        errors: [
          { field: 'productCategoryAncestors', constraint: 'isArray' },
        ],
      },
    },

    {
      acId: 'AC-08',
      title: 'Invalid productCategoryAncestors - array with non-integer values',
      input: {
        page: 1,
        size: 10,
        productCategoryAncestors: ['invalid', 'values'],
      },
      expected: {
        valid: false,
        errors: [
          { field: 'productCategoryAncestors', constraint: 'isInt' },
        ],
      },
    },

    // ==================== BOUNDARY VALUES ====================
    {
      acId: 'AC-11',
      title: 'Page at minimum (1)',
      input: {
        page: 1,
        size: 10,
      },
      expected: {
        valid: true,
      },
    },

    {
      acId: 'AC-12',
      title: 'Page below minimum (0)',
      input: {
        page: 0,
        size: 10,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'page', constraint: 'min' },
        ],
      },
    },

    {
      acId: 'AC-13',
      title: 'Page at maximum (1000)',
      input: {
        page: 1000,
        size: 10,
      },
      expected: {
        valid: true,
      },
    },

    {
      acId: 'AC-14',
      title: 'Page exceeds maximum (1001)',
      input: {
        page: 1001,
        size: 10,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'page', constraint: 'max' },
        ],
      },
    },

    {
      acId: 'AC-15',
      title: 'Size at minimum (1)',
      input: {
        page: 1,
        size: 1,
      },
      expected: {
        valid: true,
      },
    },

    {
      acId: 'AC-16',
      title: 'Size below minimum (0)',
      input: {
        page: 1,
        size: 0,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'size', constraint: 'min' },
        ],
      },
    },

    {
      acId: 'AC-17',
      title: 'Size at maximum (100)',
      input: {
        page: 1,
        size: 100,
      },
      expected: {
        valid: true,
      },
    },

    {
      acId: 'AC-18',
      title: 'Size exceeds maximum (101)',
      input: {
        page: 1,
        size: 101,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'size', constraint: 'max' },
        ],
      },
    },

    // ==================== EDGE CASES ====================
    {
      acId: 'AC-21',
      title: 'Negative page number',
      input: {
        page: -1,
        size: 10,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'page', constraint: 'min' },
        ],
      },
    },

    {
      acId: 'AC-22',
      title: 'Negative size',
      input: {
        page: 1,
        size: -10,
      },
      expected: {
        valid: false,
        errors: [
          { field: 'size', constraint: 'min' },
        ],
      },
    },

    {
      acId: 'AC-23',
      title: 'Empty activeStatuses array',
      input: {
        page: 1,
        size: 10,
        activeStatuses: [],
      },
      expected: {
        valid: true, // Empty array is valid (no filter applied)
      },
    },

    {
      acId: 'AC-24',
      title: 'Empty productCategoryAncestors array',
      input: {
        page: 1,
        size: 10,
        productCategoryAncestors: [],
      },
      expected: {
        valid: true, // Empty array is valid (no filter applied)
      },
    },

    {
      acId: 'AC-25',
      title: 'Empty productCategoryName string',
      input: {
        page: 1,
        size: 10,
        productCategoryName: '',
      },
      expected: {
        valid: true, // Empty string is valid (no filter applied)
      },
    },
  ];

  /**
   * Run all test cases using data-driven testing
   */
  it.each(testCases)('[$acId] $title', async ({ acId, input, expected }) => {
    // Arrange
    const dto = plainToClass(GetListProductCategoryRequest, input);

    // Act
    const errors = await validate(dto);

    // Assert
    if (expected.valid) {
      assertNoValidationErrors(acId, errors);
    } else {
      assertValidationErrors(acId, errors, expected.errors!);
    }
  });

  /**
   * Test case: Unknown fields should be stripped (class-transformer behavior)
   */
  it('[AC-26] Should strip unknown fields', async () => {
    // Arrange
    const input = {
      page: 1,
      size: 10,
      unknownField: 'should be ignored',
      anotherUnknown: 123,
    };

    // Act
    const dto = plainToClass(GetListProductCategoryRequest, input);
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto).not.toHaveProperty('unknownField');
    expect(dto).not.toHaveProperty('anotherUnknown');
  });

  /**
   * Test case: Type coercion from string to number
   */
  it('[AC-27] Should coerce string numbers to integers', async () => {
    // Arrange
    const input = {
      page: '5' as any, // Query params come as strings
      size: '20' as any,
    };

    // Act
    const dto = plainToClass(GetListProductCategoryRequest, input, {
      enableImplicitConversion: true, // Enable type coercion
    });
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(typeof dto.page).toBe('number');
    expect(typeof dto.size).toBe('number');
    expect(dto.page).toBe(5);
    expect(dto.size).toBe(20);
  });
});
