/**
 * Integration Tests for GetListProductCategoryQueryHandler
 * Test Suite: GetListProductCategory
 * Layer: Application
 * Type: ITQueryHandler
 *
 * RED CODE: Tests will FAIL until GetListProductCategoryQueryHandler and repository are implemented
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GetListProductCategoryQueryHandler } from '@/components/product-catalog/application/queries/get-list-product-category.handler';
import { GetListProductCategoryQuery } from '@/components/product-catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryQueryRepository } from '@/components/product-catalog/infrastructure/repositories/get-list-product-category-query.repository';
import { seedProductCategoryTestData, TEST_TENANT_ID } from '@/test/helpers/seed-data.helper';

describe('GetListProductCategoryQueryHandler - Integration Tests', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let handler: GetListProductCategoryQueryHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'mariadb',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_DATABASE || 'test_db',
          synchronize: false,
          logging: false,
        }),
      ],
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IGetListProductCategoryQueryRepository',
          useClass: GetListProductCategoryQueryRepository,
        },
      ],
    }).compile();

    dataSource = module.get(DataSource);
    handler = module.get<GetListProductCategoryQueryHandler>(GetListProductCategoryQueryHandler);
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Seed test data
    await seedProductCategoryTestData(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Integration Rule Tests - Handler with Real Repository', () => {
    const integrationTestCases = [
      {
        acId: 'AC_Pairwise_16',
        title: 'Pairwise: activeStatuses [1] + ancestors [1,2] - real database query',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1, 2],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
          expectedActiveStatus: 1,
        },
      },
      {
        acId: 'AC_Pairwise_17',
        title: 'Pairwise: activeStatuses [0,1] - real database query',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0, 1],
          productCategoryAncestors: undefined,
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
    ];

    it.each(integrationTestCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const query = new GetListProductCategoryQuery(
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.tenantId,
        input.page,
        input.size,
      );

      // Act
      const result = await handler.execute(query);

      // Assert - Data Mapping Rule: verify output DTO structure
      expect(result).toBeDefined();
      expect(result.page).toBe(expected.page);
      expect(result.size).toBe(expected.size);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.productCategories)).toBe(true);

      // Verify response structure
      if (result.productCategories.length > 0) {
        const firstItem = result.productCategories[0];
        expect(firstItem).toHaveProperty('productCategoryId');
        expect(firstItem).toHaveProperty('productCategoryName');
        expect(firstItem).toHaveProperty('productCategoryParentId');
        expect(firstItem).toHaveProperty('productCategoryGrandParentId');
        expect(firstItem).toHaveProperty('productCategoryGrandParentName');
        expect(firstItem).toHaveProperty('creatorName');
        expect(firstItem).toHaveProperty('createdAt');
        expect(firstItem).toHaveProperty('activeStatus');

        // Verify active status filter
        if (expected.expectedActiveStatus !== undefined) {
          result.productCategories.forEach((item) => {
            expect(item.activeStatus).toBe(expected.expectedActiveStatus);
          });
        }
      }
    });
  });
});
