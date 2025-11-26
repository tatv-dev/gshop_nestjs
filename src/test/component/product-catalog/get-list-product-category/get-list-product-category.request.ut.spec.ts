/**
 * Unit Tests for GetListProductCategoryRequest DTO Validation
 * Test Suite: GetListProductCategory
 * Layer: Presentation (Contract)
 * Type: UTRequest
 */

import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetListProductCategoryRequest } from '../../../../components/product-catalog/presentation/requests/get-list-product-category.request';

describe('GetListProductCategoryRequest - Unit Tests', () => {
  const findErrorByProperty = (errors: ValidationError[], property: string): ValidationError | undefined => {
    return errors.find((e) => e.property === property);
  };

  // Helper function to check if any constraint message matches the key
  const hasMessageKey = (error: ValidationError | undefined, key: string): boolean => {
    if (!error || !error.constraints) return false;
    return Object.values(error.constraints).some(msg => msg === key || msg.includes(key));
  };

  it('TC_01: Should return multiple type errors simultaneously', async () => {
    const input = {
      productCategoryName: 123,             // wrong_type_string
      activeStatuses: "abc",                // wrong_type_array
      productCategoryAncestors: { 2: 2 },   // wrong_type_array
      tenantId: 11,
      page: "abc",                          // wrong_type_integer
      size: "abc"                           // wrong_type_integer
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const errors = await validate(dto);

    // In lỗi ra console để kiểm tra messageKey thực tế
    console.log('TC_01 Errors:', JSON.stringify(errors, null, 2));

    // Verify error count matches expected fields
    expect(errors.length).toBeGreaterThanOrEqual(5);

    // 1. productCategoryName
    const nameError = findErrorByProperty(errors, 'productCategoryName');
    expect(nameError).toBeDefined();
    expect(nameError?.value).toBe(123);
    expect(hasMessageKey(nameError, 'validation_error.wrong_type_string')).toBeTruthy();

    // 2. activeStatuses
    const statusError = findErrorByProperty(errors, 'activeStatuses');
    expect(statusError).toBeDefined();
    expect(statusError?.value).toBe("abc");
    expect(hasMessageKey(statusError, 'validation_error.wrong_type_array')).toBeTruthy();

    // 3. productCategoryAncestors
    const ancestorError = findErrorByProperty(errors, 'productCategoryAncestors');
    expect(ancestorError).toBeDefined();
    expect(hasMessageKey(ancestorError, 'validation_error.wrong_type_array')).toBeTruthy();

    // 4. page
    const pageError = findErrorByProperty(errors, 'page');
    expect(pageError).toBeDefined();
    expect(pageError?.value).toBe("abc");
    expect(hasMessageKey(pageError, 'validation_error.wrong_type_integer')).toBeTruthy();

    // 5. size
    const sizeError = findErrorByProperty(errors, 'size');
    expect(sizeError).toBeDefined();
    expect(sizeError?.value).toBe("abc");
    expect(hasMessageKey(sizeError, 'validation_error.wrong_type_integer')).toBeTruthy();
  });

  it('TC_02: Should return error for duplicate items in activeStatuses', async () => {
    const input = {
      productCategoryName: '123v',
      activeStatuses: [1, 1], // Duplicate items
      productCategoryAncestors: [1],
      tenantId: 11,
      page: 1,
      size: 20
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const errors = await validate(dto);

    // In lỗi ra console để debug
    console.log('TC_02 Errors:', JSON.stringify(errors, null, 2));

    const statusError = findErrorByProperty(errors, 'activeStatuses');
    expect(statusError).toBeDefined();
    expect(statusError?.value).toEqual([1, 1]);
    expect(hasMessageKey(statusError, 'validation_error.array_duplicate_items')).toBeTruthy();
  });

  it('TC_03: Happy Path - Should validate successfully', async () => {
    const input = {
      productCategoryName: 'Điện thoại 123',
      productCategoryAncestors: [1, 2],
      tenantId: 11,
      page: 1,
      size: 20
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    // Implicitly implies "success.query"
  });

});