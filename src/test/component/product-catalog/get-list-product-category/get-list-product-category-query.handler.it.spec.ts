/**
 * Integration Tests for GetListProductCategoryQueryHandler
 * Test Suite: GetListProductCategory
 * Layer: Application
 * Type: ITQueryHandler
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GetListProductCategoryQueryHandler } from '../../../../components/product-catalog/application/handlers/get-list-product-category.handler';
import { GetListProductCategoryQuery } from '../../../../components/product-catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../../../components/product-catalog/application/dtos/get-list-product-category.dto';
import { ProductCategoryQueryRepository } from '../../../../components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { ProductCategoryModel } from '../../../../components/product-catalog/infrastructure/entities/product-category.model';
import { seedProductCategoryTestData, TEST_TENANT_ID } from '../../../helpers/seed-data.helper';

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
          entities: [ProductCategoryModel],
        }),
        TypeOrmModule.forFeature([ProductCategoryModel]),
      ],
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IProductCategoryQueryRepository',
          useClass: ProductCategoryQueryRepository,
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
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1, 2], page: 1, size: 20 },
        expected: { page: 1, size: 20, expectedActiveStatus: 1 },
      },
      {
        acId: 'AC_Pairwise_17',
        title: 'Pairwise: activeStatuses [0,1] - real database query',
        input: { tenantId: TEST_TENANT_ID, productCategoryName: 'Điện thoại 123', activeStatuses: [0, 1], page: 1, size: 20 },
        expected: { page: 1, size: 20 },
      },
    ];

    it.each(integrationTestCases)('[$acId] $title', async ({ acId, input, expected }) => {
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
      expect(result).toBeDefined();
      expect(result.page).toBe(expected.page);
      expect(result.size).toBe(expected.size);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.data)).toBe(true);

      // Verify response structure
      if (result.data.length > 0) {
        const firstItem = result.data[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('tenantId');
        expect(firstItem).toHaveProperty('activeStatus');

        if (expected.expectedActiveStatus !== undefined) {
          result.data.forEach((item) => {
            expect(item.activeStatus).toBe(expected.expectedActiveStatus);
          });
        }
      }
    });
  });
});
