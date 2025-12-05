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

    // Assert - Expected errors from input_v2.yaml
    const expectedErrors = [
      { field: 'productCategoryName', value: 123, messageKey: 'validation_error.wrong_type_string' },
      { field: 'activeStatuses', value: 'abc', messageKey: 'validation_error.wrong_type_array' },
      { field: 'productCategoryAncestors', value: 2, messageKey: 'validation_error.wrong_type_array' },
      { field: 'page', value: 'abc', messageKey: 'validation_error.wrong_type_integer' },
      { field: 'size', value: 'abc', messageKey: 'validation_error.wrong_type_integer' },
    ];

    // Verify total error count matches expected
    expect(errors).toHaveLength(expectedErrors.length); // AC_UT_01

    // Verify each error item individually
    const findError = (field: string) => errors.find((e: any) => e.field === field);

    expectedErrors.forEach((expectedError) => {
      const actualError = findError(expectedError.field);
      expect(actualError).toBeDefined(); // AC_UT_01: error for ${expectedError.field} exists
      expect(actualError?.field).toBe(expectedError.field); // AC_UT_01: field matches
      expect(actualError?.value).toEqual(expectedError.value); // AC_UT_01: value matches
      expect(actualError?.messageKey).toBe(expectedError.messageKey); // AC_UT_01: messageKey matches
    });
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

    // Assert - Expected errors from input_v2.yaml
    const expectedErrors = [
      { field: 'activeStatuses', value: [1, 1], messageKey: 'validation_error.array_duplicate_items' },
    ];

    // Verify total error count matches expected
    expect(errors).toHaveLength(expectedErrors.length); // AC_UT_02

    // Verify each error item individually
    const findError = (field: string) => errors.find((e: any) => e.field === field);

    expectedErrors.forEach((expectedError) => {
      const actualError = findError(expectedError.field);
      expect(actualError).toBeDefined(); // AC_UT_02: error exists
      expect(actualError?.field).toBe(expectedError.field); // AC_UT_02: field matches
      expect(actualError?.value).toEqual(expectedError.value); // AC_UT_02: value matches
      expect(actualError?.messageKey).toBe(expectedError.messageKey); // AC_UT_02: messageKey matches
    });
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