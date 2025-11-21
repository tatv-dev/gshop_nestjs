// test/component/product-catalog/test-helpers/assertions.helper.ts
import { ValidationError } from 'class-validator';
import { ExpectedValidationError, ExpectedGetListResponse } from './test-data.factory';

/**
 * Assertion Helpers
 * Reusable assertion functions for tests
 */

/**
 * Assert validation errors match expected errors
 */
export function assertValidationErrors(
  acId: string,
  errors: ValidationError[],
  expectedErrors: ExpectedValidationError[],
): void {
  expect(errors.length).toBeGreaterThan(0);

  expectedErrors.forEach((expectedError) => {
    const error = errors.find((e) => e.property === expectedError.field);

    expect(error).toBeDefined();
    expect(error!.constraints).toHaveProperty(expectedError.constraint);

    if (expectedError.message) {
      const actualMessage = error!.constraints![expectedError.constraint];
      expect(actualMessage).toContain(expectedError.message);
    }
  });
}

/**
 * Assert no validation errors
 */
export function assertNoValidationErrors(acId: string, errors: ValidationError[]): void {
  expect(errors).toHaveLength(0);
}

/**
 * Assert get-list response structure and data
 */
export function assertGetListResponse(
  acId: string,
  actual: any,
  expected: ExpectedGetListResponse,
): void {
  // Assert pagination meta
  expect(actual.page).toBe(expected.page);
  expect(actual.size).toBe(expected.size);
  expect(actual.total).toBe(expected.total);
  expect(actual.totalPages).toBe(expected.totalPages);

  // Assert data array
  expect(actual.data).toBeInstanceOf(Array);
  expect(actual.data).toHaveLength(expected.dataLength);

  // Assert first item if specified
  if (expected.firstCategoryName && actual.data.length > 0) {
    expect(actual.data[0].name).toBe(expected.firstCategoryName);
  }

  // Assert data structure of first item
  if (actual.data.length > 0) {
    const firstItem = actual.data[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('name');
    expect(firstItem).toHaveProperty('tenantId');
    expect(firstItem).toHaveProperty('level');
    expect(firstItem).toHaveProperty('activeStatus');
  }
}

/**
 * Assert empty response (no data)
 */
export function assertEmptyResponse(acId: string, actual: any): void {
  expect(actual.data).toBeInstanceOf(Array);
  expect(actual.data).toHaveLength(0);
  expect(actual.total).toBe(0);
  expect(actual.totalPages).toBe(0);
}

/**
 * Assert exception thrown with specific type and message
 */
export function assertException(
  acId: string,
  error: any,
  expectedType: any,
  expectedMessageKey?: string,
): void {
  expect(error).toBeInstanceOf(expectedType);

  if (expectedMessageKey) {
    expect(error.messageKey).toBe(expectedMessageKey);
  }
}

/**
 * Assert product category entity fields
 */
export function assertProductCategoryFields(acId: string, category: any): void {
  expect(category).toHaveProperty('id');
  expect(category).toHaveProperty('tenantId');
  expect(category).toHaveProperty('level');
  expect(category).toHaveProperty('activeStatus');

  expect(typeof category.id).toBe('number');
  expect(typeof category.tenantId).toBe('number');
  expect(typeof category.level).toBe('number');
  expect(typeof category.activeStatus).toBe('number');

  expect(category.level).toBeGreaterThanOrEqual(1);
  expect(category.level).toBeLessThanOrEqual(3);
  expect([0, 1]).toContain(category.activeStatus);
}

/**
 * Assert HTTP response structure (for E2E tests)
 */
export function assertHttpResponse(
  acId: string,
  response: any,
  expectedStatus: number,
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();
}

/**
 * Assert error response structure (RFC 7807)
 */
export function assertErrorResponse(
  acId: string,
  response: any,
  expectedMessageKey: string,
  expectedStatus: number,
): void {
  expect(response.body).toHaveProperty('messageKey');
  expect(response.body).toHaveProperty('title');
  expect(response.body).toHaveProperty('status');
  expect(response.body).toHaveProperty('detail');
  expect(response.body).toHaveProperty('instance');
  expect(response.body).toHaveProperty('timestamp');

  expect(response.body.messageKey).toBe(expectedMessageKey);
  expect(response.body.status).toBe(expectedStatus);
}
