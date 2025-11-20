// test/component/product-catalog/get-list-product-category/integration/handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QueryRunner } from 'typeorm';
import { GetListProductCategoryQueryHandler } from '../../../../../src/components/product-catalog/application/handlers/get-list-product-category.handler';
import { ProductCategoryQueryRepository } from '../../../../../src/components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { GetListProductCategoryQuery } from '../../../../../src/components/product-catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../../../../src/components/product-catalog/application/dtos/get-list-product-category.dto';
import { ApplicationException } from '../../../../../src/shared/application/exceptions/application.exception';
import {
  initializeTestDatabase,
  createTestQueryRunner,
  rollbackTestTransaction,
  closeTestDatabase,
} from '../../test-helpers/database.helper';
import {
  seedGetListProductCategoryTestData,
  seedPaginationTestData,
} from '../../test-helpers/seed-data.helper';
import { GetListTestCase } from '../../test-helpers/test-data.factory';
import { assertGetListResponse } from '../../test-helpers/assertions.helper';

/**
 * GetListProductCategoryQueryHandler - Integration Test
 * Tests complete handler flow with real database
 *
 * Layer: Application Layer
 * Test Type: Integration Test
 * Mock Strategy: NO mocks - uses real database with transaction rollback
 *
 * Test Focus:
 * - Complete use case flow: Handler → Repository → Database
 * - Data transformation: DB model → Domain entity → Response DTO
 * - Pagination calculation with real data
 * - Filter and search with real queries
 * - Exception handling with real scenarios
 */
describe('GetListProductCategoryQueryHandler - Integration Test', () => {
  let queryRunner: QueryRunner;
  let handler: GetListProductCategoryQueryHandler;
  let repository: ProductCategoryQueryRepository;

  /**
   * Setup: Initialize database connection ONCE for all tests
   */
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  /**
   * Setup: Create transaction and seed data BEFORE EACH test
   */
  beforeEach(async () => {
    queryRunner = await createTestQueryRunner();

    // Seed test data
    await seedGetListProductCategoryTestData(queryRunner);

    // Setup repository with real database
    const productCategoryRepository = queryRunner.manager.getRepository(
      require('../../../../../src/components/product-catalog/infrastructure/entities/product-category.model').ProductCategoryModel,
    );
    repository = new ProductCategoryQueryRepository(productCategoryRepository);

    // Setup handler with real repository
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IProductCategoryQueryRepository',
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetListProductCategoryQueryHandler>(GetListProductCategoryQueryHandler);
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
   * Test Cases: Complete Flow - Happy Path
   */
  describe('Complete Flow - Happy Path', () => {
    const happyPathCases: GetListTestCase[] = [
      {
        acId: 'AC-HIT-01',
        title: 'Get all categories for tenant 1',
        input: {
          tenantId: 1,
          page: 1,
          size: 10,
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
        acId: 'AC-HIT-02',
        title: 'Get categories with pagination',
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
        acId: 'AC-HIT-03',
        title: 'Get categories - second page',
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
        acId: 'AC-HIT-04',
        title: 'Get categories - last page with partial results',
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
    ];

    it.each(happyPathCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = new GetListProductCategoryDTO(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.page,
        input.size,
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      assertGetListResponse(acId, result, expected.response!);
    });
  });

  /**
   * Test Cases: Filter and Search
   */
  describe('Filter and Search', () => {
    it('[AC-HIT-10] Filter by active status = 1', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, [1], undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
      result.data.forEach((item) => {
        expect(item.activeStatus).toBe(1);
      });
    });

    it('[AC-HIT-11] Search by category name', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, 'Electronics', undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Electronics');
    });

    it('[AC-HIT-12] Filter by ancestors', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, [1], 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.total).toBe(3); // Computers, Mobile Phones, Laptops
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test Cases: Empty Results
   */
  describe('Empty Results', () => {
    it('[AC-HIT-20] Empty result for non-existent tenant', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(999, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('[AC-HIT-21] Empty result for non-matching search', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, 'NonExistent', undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  /**
   * Test Cases: Exception Scenarios
   */
  describe('Exception Scenarios', () => {
    it('[AC-HIT-30] Throws exception for page exceeding totalPages', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 10, 2);
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

      try {
        await handler.execute(query);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.messageKey).toBe('max.numeric');
      }
    });

    it('[AC-HIT-31] Throws exception for invalid page (0)', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 0, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

      try {
        await handler.execute(query);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.messageKey).toBe('min.numeric');
      }
    });

    it('[AC-HIT-32] Throws exception for invalid size (0)', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 0);
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

      try {
        await handler.execute(query);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.messageKey).toBe('between.numeric');
      }
    });

    it('[AC-HIT-33] Throws exception for size > 100', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 101);
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

      try {
        await handler.execute(query);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.messageKey).toBe('between.numeric');
      }
    });
  });

  /**
   * Test Cases: Large Dataset (Pagination Boundaries)
   */
  describe('Large Dataset - Pagination Boundaries', () => {
    beforeEach(async () => {
      // Seed 150 categories for pagination testing
      await seedPaginationTestData(queryRunner, 100);
    });

    it('[AC-HIT-40] First page of large dataset', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(100, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(150);
      expect(result.totalPages).toBe(15);
      expect(result.page).toBe(1);
    });

    it('[AC-HIT-41] Last page of large dataset', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(100, undefined, undefined, undefined, 15, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(150);
      expect(result.page).toBe(15);
    });

    it('[AC-HIT-42] Page exceeds totalPages for large dataset', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(100, undefined, undefined, undefined, 16, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);
    });

    it('[AC-HIT-43] Max page size with large dataset', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(100, undefined, undefined, undefined, 1, 100);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(100);
      expect(result.total).toBe(150);
      expect(result.totalPages).toBe(2);
    });
  });

  /**
   * Test Cases: Data Transformation
   * Verify complete data flow: DB → Domain → DTO
   */
  describe('Data Transformation', () => {
    it('[AC-HIT-50] Maps database fields to response DTO correctly', async () => {
      // Arrange
      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data.length).toBeGreaterThan(0);

      const firstItem = result.data[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('tenantId');
      expect(firstItem).toHaveProperty('level');
      expect(firstItem).toHaveProperty('activeStatus');
      expect(firstItem).toHaveProperty('productCategoryParentId');
      expect(firstItem).toHaveProperty('parentLevel1Id');
      expect(firstItem).toHaveProperty('parentLevel2Id');
      expect(firstItem).toHaveProperty('creatorId');

      // Verify types
      expect(typeof firstItem.id).toBe('number');
      expect(typeof firstItem.name).toBe('string');
      expect(typeof firstItem.tenantId).toBe('number');
      expect(typeof firstItem.level).toBe('number');
      expect(typeof firstItem.activeStatus).toBe('number');
    });
  });
});
