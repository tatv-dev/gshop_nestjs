/**
 * Integration Tests for GetListProductCategoryQueryRepository
 * Test Suite: GetListProductCategory
 * Layer: Infrastructure (outboundDB)
 * Type: ITQueryRepository
 *
 * RED CODE: Tests will FAIL until GetListProductCategoryQueryRepository is implemented
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { GetListProductCategoryQueryRepository } from '@/components/product-catalog/infrastructure/repositories/get-list-product-category-query.repository';
import { IGetListProductCategoryQueryRepository } from '@/components/product-catalog/application/repositories/i-get-list-product-category-query.repository';
import { GetListProductCategoryQueryDTO } from '@/components/product-catalog/application/queries/get-list-product-category.query';
import { seedProductCategoryTestData, TEST_TENANT_ID } from '@/test/helpers/seed-data.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('GetListProductCategoryQueryRepository - Integration Tests', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let repository: IGetListProductCategoryQueryRepository;

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
        {
          provide: 'IGetListProductCategoryQueryRepository',
          useClass: GetListProductCategoryQueryRepository,
        },
      ],
    }).compile();

    dataSource = module.get(DataSource);
    repository = module.get<IGetListProductCategoryQueryRepository>('IGetListProductCategoryQueryRepository');
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

  describe('Pairwise Tests - activeStatuses × productCategoryAncestors', () => {
    const pairwiseTestCases = [
      {
        acId: 'AC_Pairwise_01',
        title: 'Pairwise: activeStatuses × productCategoryAncestors (page 2)',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: undefined,
          productCategoryAncestors: undefined,
          tenantId: TEST_TENANT_ID,
          page: 2,
          size: 10,
        },
        expected: {
          page: 2,
          size: 10,
        },
      },
      {
        acId: 'AC_Pairwise_02',
        title: 'Pairwise: empty productCategoryAncestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: undefined,
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_03',
        title: 'Pairwise: single productCategoryAncestor',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: undefined,
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_04',
        title: 'Pairwise: multiple productCategoryAncestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: undefined,
          productCategoryAncestors: [1, 2],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_05',
        title: 'Pairwise: empty activeStatuses',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [],
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
      {
        acId: 'AC_Pairwise_06',
        title: 'Pairwise: empty activeStatuses + empty ancestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [],
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_07',
        title: 'Pairwise: empty activeStatuses + single ancestor',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_08',
        title: 'Pairwise: empty activeStatuses + multiple ancestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [],
          productCategoryAncestors: [1, 2],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_09',
        title: 'Pairwise: activeStatuses [0] only',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: undefined,
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
          expectedActiveStatus: 0,
        },
      },
      {
        acId: 'AC_Pairwise_10',
        title: 'Pairwise: activeStatuses [0] + empty ancestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
          expectedActiveStatus: 0,
        },
      },
      {
        acId: 'AC_Pairwise_11',
        title: 'Pairwise: activeStatuses [0] + single ancestor',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
          expectedActiveStatus: 0,
        },
      },
      {
        acId: 'AC_Pairwise_14',
        title: 'Pairwise: activeStatuses [1] + empty ancestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [],
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
        acId: 'AC_Pairwise_15',
        title: 'Pairwise: activeStatuses [1] + single ancestor',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
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
        acId: 'AC_Pairwise_18',
        title: 'Pairwise: activeStatuses [0,1] + empty ancestors',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0, 1],
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_19',
        title: 'Pairwise: activeStatuses [0,1] + single ancestor',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0, 1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          page: 1,
          size: 20,
        },
      },
      {
        acId: 'AC_Pairwise_20',
        title: 'Pairwise: no data case',
        input: {
          productCategoryName: 'NonExistentCategory12345',
          activeStatuses: [0, 1],
          productCategoryAncestors: [1, 2],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          total: 0,
          page: 1,
          size: 20,
          items: [],
        },
      },
    ];

    it.each(pairwiseTestCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const queryDTO: GetListProductCategoryQueryDTO = {
        productCategoryName: input.productCategoryName,
        activeStatuses: input.activeStatuses,
        productCategoryAncestors: input.productCategoryAncestors,
        tenantId: input.tenantId,
        page: input.page,
        size: input.size,
      };

      // Act
      const result = await repository.find(queryDTO);

      // Assert
      expect(result).toBeDefined();
      expect(result.page).toBe(expected.page);
      expect(result.size).toBe(expected.size);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.items)).toBe(true);

      if (expected.total !== undefined) {
        expect(result.total).toBe(expected.total);
      }

      if (expected.items !== undefined) {
        expect(result.items).toEqual(expected.items);
      }

      if (expected.expectedActiveStatus !== undefined && result.items.length > 0) {
        result.items.forEach((item) => {
          expect(item.activeStatus).toBe(expected.expectedActiveStatus);
        });
      }

      // Verify response structure
      if (result.items.length > 0) {
        const firstItem = result.items[0];
        expect(firstItem).toHaveProperty('productCategoryId');
        expect(firstItem).toHaveProperty('productCategoryName');
        expect(firstItem).toHaveProperty('productCategoryParentId');
        expect(firstItem).toHaveProperty('productCategoryGrandParentId');
        expect(firstItem).toHaveProperty('productCategoryGrandParentName');
        expect(firstItem).toHaveProperty('creatorName');
        expect(firstItem).toHaveProperty('createdAt');
        expect(firstItem).toHaveProperty('activeStatus');
      }
    });
  });
});
