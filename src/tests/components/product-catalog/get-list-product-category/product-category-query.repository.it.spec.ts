/**
 * Integration Tests for ProductCategoryQueryRepository
 * Test Suite: GetListProductCategory
 * Layer: Infrastructure (outboundDB)
 * Type: ITQueryRepository
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { ProductCategoryQueryRepository } from '../../../../components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { IProductCategoryQueryRepository } from '../../../../components/product-catalog/application/repositories/product-category-query.repository';
import { TEST_TENANT_ID } from './get-list-product-category.seed';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductCategoryModel } from '../../../../components/product-catalog/infrastructure/entities/product-category.model';

describe('ProductCategoryQueryRepository - Integration Tests', () => {
  let module: TestingModule;
  let repository: IProductCategoryQueryRepository;

  beforeAll(async () => {
    // ⚠️ IMPORTANT: Data must be seeded before running tests
    // Run: npm run test:seed get-list-product-category

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
          entities: [ProductCategoryModel],
        }),
        TypeOrmModule.forFeature([ProductCategoryModel]),
      ],
      providers: [
        {
          provide: 'IProductCategoryQueryRepository',
          useClass: ProductCategoryQueryRepository,
        },
      ],
    }).compile();

    repository = module.get<IProductCategoryQueryRepository>('IProductCategoryQueryRepository');
  });

  afterAll(async () => {
    // ⚠️ Data cleanup is done via: npm run test:cleanup get-list-product-category
    await module.close();
  });

  describe('Pairwise Tests - activeStatuses × productCategoryAncestors', () => {
    const pairwiseTestCases = [
      {
        acId: 'AC_Pairwise_01',
        title: 'Pairwise: page 2',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', page: 2, size: 10 },
        expected: { page: 2, size: 10 },
      },
      {
        acId: 'AC_Pairwise_02',
        title: 'Pairwise: empty productCategoryAncestors',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', productCategoryAncestors: [], page: 1, size: 20 },
        expected: { page: 1, size: 20 },
      },
      {
        acId: 'AC_Pairwise_03',
        title: 'Pairwise: single productCategoryAncestor',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { page: 1, size: 20 },
      },
      {
        acId: 'AC_Pairwise_05',
        title: 'Pairwise: empty activeStatuses',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', activeStatuses: [], page: 1, size: 20 },
        expected: { page: 1, size: 20 },
      },
      {
        acId: 'AC_Pairwise_09',
        title: 'Pairwise: activeStatuses [0] only',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', activeStatuses: [0], page: 1, size: 20 },
        expected: { page: 1, size: 20, expectedActiveStatus: 0 },
      },
      {
        acId: 'AC_Pairwise_14',
        title: 'Pairwise: activeStatuses [1] + empty ancestors',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [], page: 1, size: 20 },
        expected: { page: 1, size: 20, expectedActiveStatus: 1 },
      },
      {
        acId: 'AC_Pairwise_20',
        title: 'Pairwise: no data case',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'NonExistentCategory12345', activeStatuses: [0, 1], productCategoryAncestors: [1, 2], page: 1, size: 20 },
        expected: { total: 0, page: 1, size: 20 },
      },
    ];

    it.each(pairwiseTestCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Act
      const models = await repository.findAll(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.page,
        input.size,
      );

      const total = await repository.count(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
      );

      // Assert
      expect(Array.isArray(models)).toBe(true);
      expect(total).toBeGreaterThanOrEqual(0);

      if (expected.total !== undefined) {
        expect(total).toBe(expected.total);
      }

      if (expected.expectedActiveStatus !== undefined && models.length > 0) {
        models.forEach((model) => {
          expect(Number(model.active_status)).toBe(expected.expectedActiveStatus);
        });
      }

      // Verify model structure
      if (models.length > 0) {
        const firstModel = models[0];
        expect(firstModel).toHaveProperty('id');
        expect(firstModel).toHaveProperty('name');
        expect(firstModel).toHaveProperty('tenant_id');
        expect(firstModel).toHaveProperty('active_status');
      }
    });
  });
});
