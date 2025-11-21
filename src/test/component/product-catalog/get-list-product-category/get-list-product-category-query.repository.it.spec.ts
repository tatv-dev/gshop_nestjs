import { QueryRunner } from 'typeorm';
import { DatabaseHelper } from '../test-helpers/database.helper';
import { SeedDataHelper } from '../test-helpers/seed-data.helper';
import { ProductCategoryQueryRepository } from '../../../../components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { ProductCategoryModel } from '../../../../components/product-catalog/infrastructure/entities/product-category.model';

/**
 * Layer: Infrastructure
 * Type: Integration Test
 * Focus: Real database queries, returns ProductCategoryModel[] directly (no mapping)
 *
 * Repository signature after refactoring:
 * - findAll(tenantId, productCategoryName?, activeStatuses?, productCategoryAncestors?, page?, size?): Promise<ProductCategoryModel[]>
 * - count(tenantId, productCategoryName?, activeStatuses?, productCategoryAncestors?): Promise<number>
 */
describe('GetListProductCategoryQueryRepository Integration', () => {
  let queryRunner: QueryRunner;
  let repository: ProductCategoryQueryRepository;

  beforeAll(async () => {
    await DatabaseHelper.initialize();
  });

  afterAll(async () => {
    await DatabaseHelper.close();
  });

  beforeEach(async () => {
    queryRunner = await DatabaseHelper.getQueryRunner();

    // Seed Data
    await SeedDataHelper.seedProductCategories(queryRunner);

    // Initialize Repository with TypeORM Repository (not EntityManager)
    const productCategoryRepo = queryRunner.manager.getRepository(ProductCategoryModel);
    repository = new ProductCategoryQueryRepository(productCategoryRepo);
  });

  afterEach(async () => {
    await DatabaseHelper.rollbackAndRelease(queryRunner);
  });

  // Data provider for Pairwise tests
  const testCases = [
    {
      acId: 'AC_Pairwise_03',
      title: 'Filter by Name + Ancestor',
      input: {
        tenantId: 11,
        productCategoryName: 'Điện thoại 123',
        activeStatuses: undefined,
        productCategoryAncestors: [1],
        page: 1,
        size: 20
      },
      expectedCount: 1,
      expectedFirstId: 4
    },
    {
      acId: 'AC_Pairwise_09',
      title: 'Filter by Active Status 0 (Inactive)',
      input: {
        tenantId: 11,
        productCategoryName: undefined,
        activeStatuses: [0],
        productCategoryAncestors: undefined,
        page: 1,
        size: 20
      },
      expectedCount: 1,
      expectedFirstId: 3
    },
    {
      acId: 'AC_Pairwise_20',
      title: 'No results found',
      input: {
        tenantId: 11,
        productCategoryName: 'NonExistent',
        activeStatuses: undefined,
        productCategoryAncestors: undefined,
        page: 1,
        size: 20
      },
      expectedCount: 0
    }
  ];

  test.each(testCases)('[$acId] $title', async ({ input, expectedCount, expectedFirstId }) => {
    // Arrange - extract individual params from input object
    const { tenantId, productCategoryName, activeStatuses, productCategoryAncestors, page, size } = input;

    // Act - call findAll with individual params (new signature)
    const result = await repository.findAll(
      tenantId,
      productCategoryName,
      activeStatuses,
      productCategoryAncestors,
      page,
      size,
    );

    // Also test count
    const count = await repository.count(
      tenantId,
      productCategoryName,
      activeStatuses,
      productCategoryAncestors,
    );

    // Assert - result is ProductCategoryModel[] (array directly, not object with total/items)
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(expectedCount);
    expect(count).toBe(expectedCount);

    if (expectedCount > 0 && expectedFirstId) {
      // Model fields are snake_case
      expect(Number(result[0].id)).toBe(expectedFirstId);

      // Verify structure of ProductCategoryModel
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('tenant_id');
      expect(result[0]).toHaveProperty('product_category_parent_id');
      expect(result[0]).toHaveProperty('level');
      expect(result[0]).toHaveProperty('parent_level1_id');
      expect(result[0]).toHaveProperty('parent_level2_id');
      expect(result[0]).toHaveProperty('active_status');
      expect(result[0]).toHaveProperty('creator_id');
    }
  });

  describe('Additional Repository Tests', () => {
    it('should return empty array for non-existent tenant', async () => {
      const result = await repository.findAll(99999);
      expect(result).toHaveLength(0);
    });

    it('should filter by multiple active statuses', async () => {
      const result = await repository.findAll(11, undefined, [0, 1]);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply pagination correctly', async () => {
      const page1 = await repository.findAll(11, undefined, undefined, undefined, 1, 2);
      const page2 = await repository.findAll(11, undefined, undefined, undefined, 2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);

      if (page1.length === 2 && page2.length > 0) {
        // IDs should be different between pages
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    });
  });
});
