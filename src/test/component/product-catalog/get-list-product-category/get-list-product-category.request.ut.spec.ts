/**
 * Unit Tests for GetListProductCategoryRequest DTO Validation
 * Test Suite: GetListProductCategory
 * Layer: Presentation (Contract)
 * Type: UTRequest
 */

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetListProductCategoryRequest } from '../../../../components/product-catalog/presentation/requests/get-list-product-category.request';

describe('GetListProductCategoryRequest - Unit Tests', () => {
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
    const validationErrors = await validate(dto);

    // Debug: Show raw validation errors
    console.log('Raw validation errors:', validationErrors.map(e => ({
      property: e.property,
      value: e.value,
      constraints: e.constraints
    })));

    // Transform using base class method
    const errors = GetListProductCategoryRequest.transformValidationErrors(validationErrors);

    // Debug output
    console.log('TC_01 Transformed Errors:', JSON.stringify(errors, null, 2));

    // Verify error count matches expected fields
    expect(errors.length).toBeGreaterThanOrEqual(5);

    // Helper to find error by field
    const findError = (field: string) => errors.find(e => e.field === field);

    // 1. productCategoryName
    const nameError = findError('productCategoryName');
    expect(nameError).toBeDefined();
    expect(nameError?.value).toBe(123);
    expect(nameError?.messageKey).toBe('validation_error.wrong_type_string');

    // 2. activeStatuses
    const statusError = findError('activeStatuses');
    expect(statusError).toBeDefined();
    expect(statusError?.value).toBe("abc");
    expect(statusError?.messageKey).toBe('validation_error.wrong_type_array');

    // 3. productCategoryAncestors
    const ancestorError = findError('productCategoryAncestors');
    expect(ancestorError).toBeDefined();
    expect(ancestorError?.messageKey).toBe('validation_error.wrong_type_array');

    // 4. page
    const pageError = findError('page');
    expect(pageError).toBeDefined();
    expect(pageError?.value).toBe("abc");
    expect(pageError?.messageKey).toBe('validation_error.wrong_type_integer');

    // 5. size
    const sizeError = findError('size');
    expect(sizeError).toBeDefined();
    expect(sizeError?.value).toBe("abc");
    expect(sizeError?.messageKey).toBe('validation_error.wrong_type_integer');
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
    const validationErrors = await validate(dto);
    const errors = GetListProductCategoryRequest.transformValidationErrors(validationErrors);

    // Debug output
    console.log('TC_02 Transformed Errors:', JSON.stringify(errors, null, 2));

    const statusError = errors.find(e => e.field === 'activeStatuses');
    expect(statusError).toBeDefined();
    expect(statusError?.value).toEqual([1, 1]);
    expect(statusError?.messageKey).toBe('validation_error.array_duplicate_items');
  });

  it('TC_03: Should return error for invalid array element type', async () => {
    const input = {
      productCategoryName: 'Điện thoại 123',
      activeStatuses: [1, "abc"], // Invalid element at index 1
      tenantId: 11,
      page: 1,
      size: 20
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);
    const errors = GetListProductCategoryRequest.transformValidationErrors(validationErrors);

    // Debug output
    console.log('TC_03 Transformed Errors:', JSON.stringify(errors, null, 2));

    // Should report error for element at index 1
    const elementError = errors.find(e => e.field === 'activeStatuses[1]');
    expect(elementError).toBeDefined();
    expect(elementError?.value).toBe("abc");
    expect(elementError?.messageKey).toBe('validation_error.wrong_type_integer');
  });

  it('TC_04: Should return error for page exceeding max value', async () => {
    const input = {
      productCategoryName: 'Điện thoại 123',
      activeStatuses: [1],
      tenantId: 11,
      page: 1001, // Exceeds max of 1000
      size: 20
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);
    const errors = GetListProductCategoryRequest.transformValidationErrors(validationErrors);

    // Debug output
    console.log('TC_04 Transformed Errors:', JSON.stringify(errors, null, 2));

    const pageError = errors.find(e => e.field === 'page');
    expect(pageError).toBeDefined();
    expect(pageError?.value).toBe(1001);
    expect(pageError?.messageKey).toBe('validation_error.max_value');
  });

  it('TC_05: Happy Path - Should validate successfully', async () => {
    const input = {
      productCategoryName: 'Điện thoại 123',
      productCategoryAncestors: [1, 2],
      tenantId: 11,
      page: 1,
      size: 20
    };

    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);
    const errors = GetListProductCategoryRequest.transformValidationErrors(validationErrors);

    expect(errors).toHaveLength(0);
  });
});