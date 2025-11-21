import { Test, TestingModule } from '@nestjs/testing';
import { QueryRunner } from 'typeorm';
import { DatabaseHelper } from '../../../test-helpers/database.helper';
import { SeedDataHelper } from '../../../test-helpers/seed-data.helper';

// RED CODE: Classes do not exist yet
import { GetListProductCategoryQueryHandler } from '../../../../../src/components/catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryFormRequest } from '../../../../../src/components/catalog/presentation/request/get-list-product-category.request';
import { IProductCategoryQueryRepository } from '../../../../../src/components/catalog/application/repositories/product-category-query.repository.interface';
import { GetListProductCategoryQueryRepository } from '../../../../../src/components/catalog/infrastructure/repositories/get-list-product-category-query.repository';

/**
 * Layer: Application
 * Type: Integration Test (Handler + Real DB)
 * Focus: Use case orchestration, DTO mapping, repository call integration.
 */
describe('GetListProductCategoryQueryHandler Integration', () => {
  let queryRunner: QueryRunner;
  let handler: GetListProductCategoryQueryHandler;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    await DatabaseHelper.initialize();
  });

  afterAll(async () => {
    await DatabaseHelper.close();
  });

  beforeEach(async () => {
    queryRunner = await DatabaseHelper.getQueryRunner();
    await SeedDataHelper.seedProductCategories(queryRunner);

    moduleRef = await Test.createTestingModule({
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IProductCategoryQueryRepository',
          useFactory: () => new GetListProductCategoryQueryRepository(queryRunner.manager),
        },
      ],
    }).compile();

    handler = moduleRef.get<GetListProductCategoryQueryHandler>(GetListProductCategoryQueryHandler);
  });

  afterEach(async () => {
    await DatabaseHelper.rollbackAndRelease(queryRunner);
  });

  const testCases = [
    {
      acId: 'AC_Pairwise_16',
      title: 'Handler processes request and returns mapped DTO',
      input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], tenantId: 11, page: 1, size: 20 },
      expectedTotal: 1
    }
  ];

  test.each(testCases)('[$acId] $title', async ({ input, expectedTotal }) => {
    // Arrange
    const request = new GetListProductCategoryFormRequest();
    Object.assign(request, input);

    // Act
    const response = await handler.execute(request);

    // Assert
    expect(response).toBeDefined();
    expect(response.total).toBe(expectedTotal);
    expect(response.productCategories).toBeInstanceOf(Array);
    
    if (expectedTotal > 0) {
        const item = response.productCategories[0];
        // Check Application Layer DTO Structure (ResponseDTO)
        expect(item.productCategoryId).toBeDefined();
        expect(item.activeStatus).toBe(1);
    }
  });
});