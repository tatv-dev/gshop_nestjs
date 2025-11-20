// test/component/product-catalog/test-helpers/test-data.factory.ts

/**
 * Test Data Factories
 * Generate test data for various test scenarios
 */

/**
 * Generate a long category name for boundary testing
 * Max length: 255 characters
 */
export function generateMaxLengthCategoryName(): string {
  return 'A'.repeat(255);
}

/**
 * Generate category name exceeding max length
 * Length: 256 characters (invalid)
 */
export function generateExceedingMaxLengthCategoryName(): string {
  return 'A'.repeat(256);
}

/**
 * Generate many product categories for pagination testing
 */
export function generateManyCategories(count: number, startId: number = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    name: `Category ${startId + i}`,
    tenantId: 1,
    productCategoryParentId: null,
    level: 1,
    parentLevel1Id: null,
    parentLevel2Id: null,
    activeStatus: 1,
    creatorId: 1,
  }));
}

/**
 * Base test data for GetListProductCategoryRequest
 */
export const baseGetListRequestData = {
  tenantId: 1,
  page: 1,
  size: 10,
};

/**
 * Valid GetListProductCategoryRequest with all optional fields
 */
export const validFullRequestData = {
  ...baseGetListRequestData,
  productCategoryName: 'Electronics',
  activeStatuses: [1],
  productCategoryAncestors: [1, 2],
};

/**
 * Generate request data for specific test cases
 */
export function createRequestData(overrides: Partial<any> = {}) {
  return {
    ...baseGetListRequestData,
    ...overrides,
  };
}

/**
 * Expected response structure for assertions
 */
export interface ExpectedGetListResponse {
  dataLength: number;
  page: number;
  size: number;
  total: number;
  totalPages: number;
  firstCategoryName?: string;
}

/**
 * Expected validation error structure
 */
export interface ExpectedValidationError {
  field: string;
  constraint: string;
  message?: string; // Optional: use for partial matching
}

/**
 * Test case data structure for test.each()
 */
export interface GetListTestCase {
  acId: string;
  title: string;
  input: any;
  expected: {
    valid?: boolean;
    errors?: ExpectedValidationError[];
    response?: ExpectedGetListResponse;
    exception?: {
      type: string;
      messageKey: string;
    };
  };
}
