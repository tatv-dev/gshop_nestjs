import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetListProductCategoryRequest } from '../../../../components/product-catalog/presentation/requests/get-list-product-category.request';

describe('GetListProductCategoryRequest Validation', () => {
  it('AC_UT_01: return error message when: <productCategoryName> is provided as non-string, <activeStatuses> is provided as non-array, <productCategoryAncestors> is provided as non-array, <page> is provided as non-integer, <size> is provided as non-integer', async () => {
    // Arrange
    const input: any = {
      productCategoryName: 123,
      activeStatuses: 'abc',
      productCategoryAncestors: 2,
      page: 'abc',
      size: 'abc',
    };

    // Act
    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);

    // Debug output (ALWAYS include for visibility)
    console.log('Raw validation errors:', validationErrors.map((e) => ({ property: e.property, value: (e as any).value, constraints: e.constraints })));

    // Transform using BaseRequestDTO method
    const errors = (GetListProductCategoryRequest as any).transformValidationErrors(validationErrors);

    // Debug output (ALWAYS include)
    console.log('AC_UT_01 Transformed Errors:', JSON.stringify(errors, null, 2));

    // Assert
    const findError = (field: string) => errors.find((e: any) => e.field === field);

    const nameError = findError('productCategoryName');
    expect(nameError).toBeDefined();
    expect(nameError?.value).toBe(123);
    expect(nameError?.messageKey).toBe('validation_error.wrong_type_string');

    const activeStatusesError = findError('activeStatuses');
    expect(activeStatusesError).toBeDefined();
    expect(activeStatusesError?.value).toBe('abc');
    expect(activeStatusesError?.messageKey).toBe('validation_error.wrong_type_array');

    const ancestorsError = findError('productCategoryAncestors');
    expect(ancestorsError).toBeDefined();
    expect(ancestorsError?.value).toBe(2);
    expect(ancestorsError?.messageKey).toBe('validation_error.wrong_type_array');

    const pageError = findError('page');
    expect(pageError).toBeDefined();
    expect(pageError?.value).toBe('abc');
    expect(pageError?.messageKey).toBe('validation_error.wrong_type_integer');

    const sizeError = findError('size');
    expect(sizeError).toBeDefined();
    expect(sizeError?.value).toBe('abc');
    expect(sizeError?.messageKey).toBe('validation_error.wrong_type_integer');
  });

  it('AC_UT_02: return error message when: <activeStatuses> array contains duplicate elements', async () => {
    // Arrange
    const input: any = {
      productCategoryName: '123v',
      activeStatuses: [1, 1],
      productCategoryAncestors: [1],
      page: 1,
      size: 20,
    };

    // Act
    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);

    // Debug output
    console.log('Raw validation errors:', validationErrors.map((e) => ({ property: e.property, value: (e as any).value, constraints: e.constraints })));

    const errors = (GetListProductCategoryRequest as any).transformValidationErrors(validationErrors);

    // Debug output
    console.log('AC_UT_02 Transformed Errors:', JSON.stringify(errors, null, 2));

    // Assert
    const findError = (field: string) => errors.find((e: any) => e.field === field);

    const duplicateError = findError('activeStatuses');
    expect(duplicateError).toBeDefined();
    expect(duplicateError?.value).toEqual([1, 1]);
    expect(duplicateError?.messageKey).toBe('validation_error.array_duplicate_items');
  });

  it('AC_UT_03: return successful message when valid data is provided', async () => {
    // Arrange
    const input: any = {
      productCategoryName: 'Điện thoại 123',
      productCategoryAncestors: [1, 2],
      page: 1,
      size: 20,
    };

    // Act
    const dto = plainToClass(GetListProductCategoryRequest, input);
    const validationErrors = await validate(dto);
    const errors = (GetListProductCategoryRequest as any).transformValidationErrors(validationErrors);

    // Assert
    expect(errors).toHaveLength(0);
  });
});