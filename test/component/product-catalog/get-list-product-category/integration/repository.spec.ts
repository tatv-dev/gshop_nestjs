// test/component/product-catalog/get-list-product-category/integration/repository.spec.ts
import { QueryRunner } from 'typeorm';
import { ProductCategoryQueryRepository } from '../../../../../src/components/product-catalog/infrastructure/repositories/product-category-query.repository';
import {
  initializeTestDatabase,
  createTestQueryRunner,
  rollbackTestTransaction,
  closeTestDatabase,
} from '../../test-helpers/database.helper';
import {
  seedGetListProductCategoryTestData,
  seedEmptyTenantData,
  seedPaginationTestData,
  seedSearchFilterTestData,
} from '../../test-helpers/seed-data.helper';
import { GetListTestCase } from '../../test-helpers/test-data.factory';
import { assertGetListResponse, assertEmptyResponse, assertProductCategoryFields } from '../../test-helpers/assertions.helper';

/**
 * ProductCategoryQueryRepository - Integration Test
 * Tests repository implementation with real database
 *
 * Layer: Infrastructure Layer
 * Test Type: Integration Test
 * Mock Strategy: NO mocks - uses real database with transaction rollback
 *
 * Test Focus:
 * - Query execution with real database
 * - Data mapping from DB model to Domain entity
 * - Filtering, pagination, search logic
 * - Empty result handling
 */
describe('ProductCategoryQueryRepository - Integration Test', () => {
  let queryRunner: QueryRunner;
  let repository: ProductCategoryQueryRepository;

  /**
   * Setup: Initialize database connection ONCE for all tests
   */
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  /**
   * Setup: Create transaction and seed data BEFORE EACH test
   * Each test runs in isolated transaction
   */
  beforeEach(async () => {
    queryRunner = await createTestQueryRunner();

    // Seed test data
    await seedGetListProductCategoryTestData(queryRunner);

    // Initialize repository with the QueryRunner's manager
    const productCategoryRepository = queryRunner.manager.getRepository(
      // Note: This will FAIL because ProductCategoryModel is not imported yet
      // This is RED CODE - test should fail on missing implementation
      require('../../../../../src/components/product-catalog/infrastructure/entities/product-category.model').ProductCategoryModel,
    );
    repository = new ProductCategoryQueryRepository(productCategoryRepository);
  });

  /**
   * Cleanup: Rollback transaction AFTER EACH test
   */
  afterEach(async () => {
    await rollbackTestTransaction(queryRunner);
  });

  /**
   * Cleanup: Close database connection AFTER ALL tests
   */
  afterAll(async () => {
    await closeTestDatabase();
  });

  /**
   * Test Cases: Find All with various scenarios
   */
  describe('findAll()', () => {
    const testCases: GetListTestCase[] = [
      // ==================== HAPPY PATH ====================
      {
        acId: 'AC-IT-01',
        title: 'Find all categories for tenant 1',
        input: {
          tenantId: 1,
        },
        expected: {
          response: {
            dataLength: 5,
            page: 1,
            size: 10,
            total: 5,
            totalPages: 1,
            firstCategoryName: 'Electronics',
          },
        },
      },

      {
        acId: 'AC-IT-02',
        title: 'Find all categories for tenant 2',
        input: {
          tenantId: 2,
        },
        expected: {
          response: {
            dataLength: 1,
            page: 1,
            size: 10,
            total: 1,
            totalPages: 1,
            firstCategoryName: 'Books',
          },
        },
      },

      // ==================== PAGINATION ====================
      {
        acId: 'AC-IT-03',
        title: 'Paginate results - page 1, size 2',
        input: {
          tenantId: 1,
          page: 1,
          size: 2,
        },
        expected: {
          response: {
            dataLength: 2,
            page: 1,
            size: 2,
            total: 5,
            totalPages: 3,
          },
        },
      },

      {
        acId: 'AC-IT-04',
        title: 'Paginate results - page 2, size 2',
        input: {
          tenantId: 1,
          page: 2,
          size: 2,
        },
        expected: {
          response: {
            dataLength: 2,
            page: 2,
            size: 2,
            total: 5,
            totalPages: 3,
          },
        },
      },

      {
        acId: 'AC-IT-05',
        title: 'Paginate results - last page with partial results',
        input: {
          tenantId: 1,
          page: 3,
          size: 2,
        },
        expected: {
          response: {
            dataLength: 1,
            page: 3,
            size: 2,
            total: 5,
            totalPages: 3,
          },
        },
      },

      // ==================== FILTERING ====================
      {
        acId: 'AC-IT-06',
        title: 'Filter by active status = 1',
        input: {
          tenantId: 1,
          activeStatuses: [1],
        },
        expected: {
          response: {
            dataLength: 5,
            page: 1,
            size: 10,
            total: 5,
            totalPages: 1,
          },
        },
      },

      {
        acId: 'AC-IT-07',
        title: 'Filter by active status = 0',
        input: {
          tenantId: 1,
          activeStatuses: [0],
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      },

      {
        acId: 'AC-IT-08',
        title: 'Filter by multiple active statuses',
        input: {
          tenantId: 1,
          activeStatuses: [0, 1],
        },
        expected: {
          response: {
            dataLength: 5,
            page: 1,
            size: 10,
            total: 5,
            totalPages: 1,
          },
        },
      },

      // ==================== SEARCH ====================
      {
        acId: 'AC-IT-09',
        title: 'Search by category name (exact match)',
        input: {
          tenantId: 1,
          productCategoryName: 'Electronics',
        },
        expected: {
          response: {
            dataLength: 1,
            page: 1,
            size: 10,
            total: 1,
            totalPages: 1,
            firstCategoryName: 'Electronics',
          },
        },
      },

      {
        acId: 'AC-IT-10',
        title: 'Search by category name (partial match)',
        input: {
          tenantId: 1,
          productCategoryName: 'Comput',
        },
        expected: {
          response: {
            dataLength: 1,
            page: 1,
            size: 10,
            total: 1,
            totalPages: 1,
            firstCategoryName: 'Computers',
          },
        },
      },

      {
        acId: 'AC-IT-11',
        title: 'Search with no results',
        input: {
          tenantId: 1,
          productCategoryName: 'NonExistent',
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      },

      // ==================== ANCESTOR FILTERING ====================
      {
        acId: 'AC-IT-12',
        title: 'Filter by ancestor (parent_level1_id)',
        input: {
          tenantId: 1,
          productCategoryAncestors: [1], // Electronics
        },
        expected: {
          response: {
            dataLength: 3, // Computers, Mobile Phones, Laptops
            page: 1,
            size: 10,
            total: 3,
            totalPages: 1,
          },
        },
      },

      {
        acId: 'AC-IT-13',
        title: 'Filter by multiple ancestors',
        input: {
          tenantId: 1,
          productCategoryAncestors: [1, 2], // Electronics and Food & Beverage
        },
        expected: {
          response: {
            dataLength: 3, // All children of Electronics
            page: 1,
            size: 10,
            total: 3,
            totalPages: 1,
          },
        },
      },

      // ==================== EMPTY RESULTS ====================
      {
        acId: 'AC-IT-14',
        title: 'Empty result for non-existent tenant',
        input: {
          tenantId: 999,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      },
    ];

    /**
     * Run all test cases using data-driven testing
     */
    it.each(testCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Act
      const result = await repository.findAll(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.page,
        input.size,
      );

      // Assert
      if (expected.response!.dataLength === 0) {
        expect(result).toHaveLength(0);
      } else {
        expect(result).toHaveLength(expected.response!.dataLength);

        // Assert domain entity structure
        result.forEach((category) => {
          assertProductCategoryFields(acId, category);
        });

        // Assert first category name if specified
        if (expected.response!.firstCategoryName) {
          expect(result[0].getName()).toBe(expected.response!.firstCategoryName);
        }
      }
    });
  });

  /**
   * Test Cases: Count
   */
  describe('count()', () => {
    it('[AC-IT-20] Count all categories for tenant 1', async () => {
      // Act
      const count = await repository.count(1);

      // Assert
      expect(count).toBe(5);
    });

    it('[AC-IT-21] Count with filters', async () => {
      // Act
      const count = await repository.count(
        1,
        'Electronics', // name filter
        [1], // active status
      );

      // Assert
      expect(count).toBe(1);
    });

    it('[AC-IT-22] Count returns 0 for non-existent tenant', async () => {
      // Act
      const count = await repository.count(999);

      // Assert
      expect(count).toBe(0);
    });
  });

  /**
   * Test with empty tenant (no categories)
   */
  describe('Empty Tenant Scenarios', () => {
    beforeEach(async () => {
      // Seed empty tenant
      await seedEmptyTenantData(queryRunner, 100);
    });

    it('[AC-IT-30] Returns empty array for tenant with no categories', async () => {
      // Act
      const result = await repository.findAll(100);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('[AC-IT-31] Returns 0 count for tenant with no categories', async () => {
      // Act
      const count = await repository.count(100);

      // Assert
      expect(count).toBe(0);
    });
  });

  /**
   * Test data mapping: DB model → Domain entity
   */
  describe('Data Mapping', () => {
    it('[AC-IT-40] Maps bigint fields to number correctly', async () => {
      // Act
      const result = await repository.findAll(1);

      // Assert
      expect(result.length).toBeGreaterThan(0);

      const category = result[0];
      expect(typeof category.id).toBe('number');
      expect(typeof category.tenantId).toBe('number');
      expect(typeof category.level).toBe('number');
      expect(Number.isInteger(category.id)).toBe(true);
      expect(Number.isInteger(category.tenantId)).toBe(true);
    });

    it('[AC-IT-41] Maps null fields correctly', async () => {
      // Act
      const result = await repository.findAll(1);

      // Find level 1 category (no parent)
      const level1Category = result.find((c) => c.level === 1);

      // Assert
      expect(level1Category).toBeDefined();
      expect(level1Category!.productCategoryParentId).toBeNull();
      expect(level1Category!.parentLevel1Id).toBeNull();
      expect(level1Category!.parentLevel2Id).toBeNull();
    });
  });
});
