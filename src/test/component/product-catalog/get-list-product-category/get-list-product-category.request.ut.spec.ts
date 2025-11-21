/**
 * Unit Tests for GetListProductCategoryRequest DTO Validation
 * Test Suite: GetListProductCategory
 * Layer: Presentation (Contract)
 * Type: UTRequest
 *
 * RED CODE: Tests will FAIL until GetListProductCategoryRequest is implemented
 */

import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetListProductCategoryRequest } from '@/components/product-catalog/presentation/requests/get-list-product-category.request';
import { generateLargeArray } from '@/test/helpers/seed-data.helper';

describe('GetListProductCategoryRequest - Unit Tests', () => {
  /**
   * Helper function to find validation error by property
   */
  const findErrorByProperty = (errors: ValidationError[], property: string): ValidationError | undefined => {
    return errors.find((e) => e.property === property);
  };

  /**
   * Helper function to check if constraint exists
   */
  const hasConstraint = (error: ValidationError | undefined, constraintKey: string): boolean => {
    return error?.constraints ? Object.keys(error.constraints).includes(constraintKey) : false;
  };

  describe('Happy Path Tests', () => {
    const happyPathCases = [
      {
        acId: 'AC_OFAT_00',
        title: '[BASE]<Case cơ sở hợp lệ>',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: { valid: true },
      },
      {
        acId: 'AC_OFAT_07',
        title: '[productCategoryName]Vi phạm policy khoảng trắng (whitespace) - should trim',
        input: {
          productCategoryName: ' Điện thoại 123 ',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: { valid: true, trimmedName: 'Điện thoại 123' },
      },
      {
        acId: 'AC_OFAT_08',
        title: '[productCategoryName]Sai chuẩn hoá Unicode (EP-UNICODE-NORM) - should normalize',
        input: {
          productCategoryName: 'Cafe\u0301',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: { valid: true, normalizedName: 'Café' },
      },
    ];

    it.each(happyPathCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);

      if (expected.trimmedName) {
        expect(dto.productCategoryName).toBe(expected.trimmedName);
      }
      if (expected.normalizedName) {
        expect(dto.productCategoryName).toBe(expected.normalizedName);
      }
    });
  });

  describe('productCategoryName Validation Tests', () => {
    const productCategoryNameCases = [
      {
        acId: 'AC_OFAT_01',
        title: '[productCategoryName]Sai kiểu dữ liệu',
        input: {
          productCategoryName: 123,
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_02',
        title: '[productCategoryName]Null',
        input: {
          productCategoryName: null,
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_03',
        title: '[productCategoryName]Chuỗi rỗng/blank',
        input: {
          productCategoryName: '',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'empty_or_blank',
        },
      },
      {
        acId: 'AC_OFAT_04',
        title: '[productCategoryName]Chứa ký tự Punctuation (IV-P)',
        input: {
          productCategoryName: 'iPhone!',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'pattern_mismatch',
        },
      },
      {
        acId: 'AC_OFAT_05',
        title: '[productCategoryName]Chứa ký tự Symbol/emoji (IV-S)',
        input: {
          productCategoryName: '😃',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'pattern_mismatch',
        },
      },
      {
        acId: 'AC_OFAT_06',
        title: '[productCategoryName]Chứa Control/Mark ngoài whitelist (IV-C/Z/M)',
        input: {
          productCategoryName: 'A\u0007B',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryName',
          code: 'whitespace_violation',
        },
      },
    ];

    it.each(productCategoryNameCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });

  describe('activeStatuses Validation Tests', () => {
    const activeStatusesCases = [
      {
        acId: 'AC_OFAT_09',
        title: '[activeStatuses]Sai kiểu dữ liệu (không phải mảng)',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: '1',
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'activeStatuses',
          code: 'array_expected',
        },
      },
      {
        acId: 'AC_OFAT_10',
        title: '[activeStatuses]Null',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: null,
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'activeStatuses',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_11',
        title: '[activeStatuses]Phần tử sai kiểu',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: ['1', true],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'activeStatuses',
          code: 'array_element_invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_12',
        title: '[activeStatuses]Phần tử ngoài {0,1}',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [2],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'activeStatuses',
          code: 'array_element_invalid_value',
        },
      },
      {
        acId: 'AC_OFAT_13',
        title: '[activeStatuses]Trùng phần tử',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1, 1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'activeStatuses',
          code: 'duplicate_items',
        },
      },
    ];

    it.each(activeStatusesCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });

  describe('productCategoryAncestors Validation Tests', () => {
    const productCategoryAncestorsCases = [
      {
        acId: 'AC_OFAT_15',
        title: '[productCategoryAncestors]Sai kiểu dữ liệu (không phải mảng)',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: '1',
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryAncestors',
          code: 'array_expected',
        },
      },
      {
        acId: 'AC_OFAT_16',
        title: '[productCategoryAncestors]Null',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: null,
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryAncestors',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_17',
        title: '[productCategoryAncestors]Phần tử sai kiểu',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1, 'abc'],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryAncestors',
          code: 'array_element_invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_19',
        title: '[productCategoryAncestors]Trùng phần tử',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1, 1],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryAncestors',
          code: 'duplicate_items',
        },
      },
      {
        acId: 'AC_OFAT_20',
        title: '[productCategoryAncestors]Vượt giới hạn độ dài mảng (>9999)',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: generateLargeArray(10000),
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'productCategoryAncestors',
          code: 'item_count_out_of_range',
        },
      },
    ];

    it.each(productCategoryAncestorsCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });

  describe('tenantId Validation Tests', () => {
    const tenantIdCases = [
      {
        acId: 'AC_OFAT_23',
        title: '[tenantId]Thiếu field (missing)',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          page: 1,
          size: 20,
        },
        expected: {
          field: 'tenantId',
          code: 'missing',
        },
      },
      {
        acId: 'AC_OFAT_24',
        title: '[tenantId]Sai kiểu dữ liệu',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: '12',
          page: 1,
          size: 20,
        },
        expected: {
          field: 'tenantId',
          code: 'invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_25',
        title: '[tenantId]Null',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: null,
          page: 1,
          size: 20,
        },
        expected: {
          field: 'tenantId',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_26',
        title: '[tenantId]Chuỗi rỗng/blank',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: '',
          page: 1,
          size: 20,
        },
        expected: {
          field: 'tenantId',
          code: 'empty_or_blank',
        },
      },
    ];

    it.each(tenantIdCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });

  describe('page Validation Tests', () => {
    const pageCases = [
      {
        acId: 'AC_OFAT_29',
        title: '[page]Sai kiểu dữ liệu',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: '2',
          size: 20,
        },
        expected: {
          field: 'page',
          code: 'invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_30',
        title: '[page]Null',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: null,
          size: 20,
        },
        expected: {
          field: 'page',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_31',
        title: '[page]Chuỗi rỗng/blank',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: '',
          size: 20,
        },
        expected: {
          field: 'page',
          code: 'empty_or_blank',
        },
      },
      {
        acId: 'AC_OFAT_32',
        title: '[page]Ngoài khoảng [1,1000]',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 0,
          size: 20,
        },
        expected: {
          field: 'page',
          code: 'out_of_range',
        },
      },
    ];

    it.each(pageCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });

  describe('size Validation Tests', () => {
    const sizeCases = [
      {
        acId: 'AC_OFAT_34',
        title: '[size]Sai kiểu dữ liệu',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: '10',
        },
        expected: {
          field: 'size',
          code: 'invalid_type',
        },
      },
      {
        acId: 'AC_OFAT_35',
        title: '[size]Null',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: null,
        },
        expected: {
          field: 'size',
          code: 'null_not_allowed',
        },
      },
      {
        acId: 'AC_OFAT_36',
        title: '[size]Chuỗi rỗng/blank',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: '',
        },
        expected: {
          field: 'size',
          code: 'empty_or_blank',
        },
      },
      {
        acId: 'AC_OFAT_37',
        title: '[size]Ngoài khoảng [1,500]',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: 11,
          page: 1,
          size: 0,
        },
        expected: {
          field: 'size',
          code: 'out_of_range',
        },
      },
    ];

    it.each(sizeCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = plainToClass(GetListProductCategoryRequest, input);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });
});
