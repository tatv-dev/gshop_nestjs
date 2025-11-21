import { QueryRunner } from 'typeorm';
import { DatabaseHelper } from '../test-helpers/database.helper';
import { SeedDataHelper } from '../test-helpers/seed-data.helper';
// RED CODE: Classes do not exist yet
import { ProductCategoryQueryRepository } from '../../../../components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { GetListProductCategoryRequest } from '../../../../components/product-catalog/presentation/requests/get-list-product-category.request';
import { GetListProductCategoryDTO } from '../../../../components/product-catalog/application/dtos/get-list-product-category.dto';

/**
 * Layer: Infrastructure
 * Type: Integration Test
 * Focus: Real database queries, SQL generation, data mapping, and filtering logic.
 */
describe('GetListProductCategoryQueryRepository Integration', () => {
  let queryRunner: QueryRunner;
  let repository: ProductCategoryQueryRepository;

  beforeAll(async () => {
    // Initialize DB connection
    await DatabaseHelper.initialize();
  });

  afterAll(async () => {
    await DatabaseHelper.close();
  });

  beforeEach(async () => {
    // Start new transaction for isolation
    queryRunner = await DatabaseHelper.getQueryRunner();
    
    // Seed Data
    await SeedDataHelper.seedProductCategories(queryRunner);

    // Initialize Repository with the test query runner
    // Note: In real impl, this would be injected or set via setQueryRunner/manager
    repository = new ProductCategoryQueryRepository(queryRunner.manager);
  });

  afterEach(async () => {
    // Rollback transaction to clean up
    await DatabaseHelper.rollbackAndRelease(queryRunner);
  });

  // Data provider for Pairwise tests (Sample selection)
  const testCases = [
    {
      acId: 'AC_Pairwise_03',
      title: 'Filter by Name + Ancestor',
      input: { productCategoryName: 'Điện thoại 123', productCategoryAncestors: [1], tenantId: 11, page: 1, size: 20 },
      expectedCount: 1, // ID 4 matches name and has parent 1
      expectedFirstId: 4
    },
    {
      acId: 'AC_Pairwise_09',
      title: 'Filter by Active Status 0 (Inactive)',
      input: { productCategoryName: '', activeStatuses: [0], tenantId: 11, page: 1, size: 20 },
      expectedCount: 1, // ID 3 is inactive
      expectedFirstId: 3
    },
    {
      acId: 'AC_Pairwise_20',
      title: 'No results found',
      input: { productCategoryName: 'NonExistent', tenantId: 11, page: 1, size: 20 },
      expectedCount: 0
    }
  ];

  test.each(testCases)('[$acId] $title', async ({ input, expectedCount, expectedFirstId }) => {
    // Arrange
    const criteria = new GetListProductCategoryRequest();
    Object.assign(criteria, input);

    // Act
    const result = await repository.findAll(criteria);

    // Assert
    expect(result).toBeDefined();
    expect(result.total).toBe(expectedCount);
    expect(result.items).toHaveLength(expectedCount);

    if (expectedCount > 0 && expectedFirstId) {
      expect(result.items[0].productCategoryId).toBe(expectedFirstId);
      // Verify structure
      expect(result.items[0]).toHaveProperty('productCategoryName');
      expect(result.items[0]).toHaveProperty('creatorName');
    }
  });
});