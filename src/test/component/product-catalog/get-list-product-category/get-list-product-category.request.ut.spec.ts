/**
 * Unit Tests for GetListProductCategoryRequest DTO Validation
 * Test Suite: GetListProductCategory
 * Layer: Presentation (Contract)
 * Type: UTRequest
 */

import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetListProductCategoryRequest } from '@/components/product-catalog/presentation/requests/get-list-product-category.request';

describe('GetListProductCategoryRequest - Unit Tests', () => {
  const findErrorByProperty = (errors: ValidationError[], property: string): ValidationError | undefined => {
    return errors.find((e) => e.property === property);
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
          page: 1,
          size: 20,
        },
        expected: { valid: true },
      },
    ];

    it.each(happyPathCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('productCategoryName Validation Tests', () => {
    const productCategoryNameCases = [
      {
        acId: 'AC_OFAT_01',
        title: '[productCategoryName]Sai kiểu dữ liệu',
        input: { productCategoryName: 123, activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'productCategoryName' },
      },
      {
        acId: 'AC_OFAT_02',
        title: '[productCategoryName]Null',
        input: { productCategoryName: null, activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'productCategoryName' },
      },
      {
        acId: 'AC_OFAT_03',
        title: '[productCategoryName]Chuỗi rỗng/blank',
        input: { productCategoryName: '', activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'productCategoryName' },
      },
    ];

    it.each(productCategoryNameCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
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
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: '1', productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'activeStatuses' },
      },
      {
        acId: 'AC_OFAT_10',
        title: '[activeStatuses]Null',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: null, productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'activeStatuses' },
      },
      {
        acId: 'AC_OFAT_12',
        title: '[activeStatuses]Phần tử ngoài {0,1}',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [2], productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { field: 'activeStatuses' },
      },
    ];

    it.each(activeStatusesCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
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
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: '1', page: 1, size: 20 },
        expected: { field: 'productCategoryAncestors' },
      },
      {
        acId: 'AC_OFAT_16',
        title: '[productCategoryAncestors]Null',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: null, page: 1, size: 20 },
        expected: { field: 'productCategoryAncestors' },
      },
    ];

    it.each(productCategoryAncestorsCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
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
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 'abc', size: 20 },
        expected: { field: 'page' },
      },
      {
        acId: 'AC_OFAT_30',
        title: '[page]Null',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: null, size: 20 },
        expected: { field: 'page' },
      },
      {
        acId: 'AC_OFAT_32',
        title: '[page]Ngoài khoảng [1,1000]',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 0, size: 20 },
        expected: { field: 'page' },
      },
    ];

    it.each(pageCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
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
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 'abc' },
        expected: { field: 'size' },
      },
      {
        acId: 'AC_OFAT_35',
        title: '[size]Null',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: null },
        expected: { field: 'size' },
      },
      {
        acId: 'AC_OFAT_37',
        title: '[size]Ngoài khoảng [1,500]',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 0 },
        expected: { field: 'size' },
      },
    ];

    it.each(sizeCases)('[$acId] $title', async ({ acId, input, expected }) => {
      const dto = plainToClass(GetListProductCategoryRequest, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const fieldError = findErrorByProperty(errors, expected.field);
      expect(fieldError).toBeDefined();
    });
  });
});
