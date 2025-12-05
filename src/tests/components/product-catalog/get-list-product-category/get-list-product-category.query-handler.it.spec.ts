import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { AppModule } from '../../../../app.module';
import {
  cleanup,
  seedProductCategoriesTestData,
  seedTestData,
  TEST_PARENT_CATEGORY_ID,
  TEST_TENANT_ID,
} from './get-list-product-category.seed';

describe('GetListProductCategoryQueryHandler Integration Tests', () => {
  let moduleRef: TestingModule;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    await seedTestData(dataSource);
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await seedProductCategoriesTestData(queryRunner);
  });

  afterEach(async () => {
    try {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  });

  afterAll(async () => {
    await cleanup(dataSource);
    await moduleRef.close();
  });

  it('AC_IT_01: return successful message when: <productCategoryName> is <valid value> and <activeStatuses> is <default_value>', async () => {
    // Arrange
    const { GetListProductCategoryQueryHandler } = await import('../../../../components/product-catalog/application/queries/get-list-product-category.query-handler');
    const handler = moduleRef.get<any>(GetListProductCategoryQueryHandler);
    expect(handler).toBeDefined();

    const query = {
      productCategoryName: 'Điện thoại 123',
      productCategoryAncestors: [TEST_PARENT_CATEGORY_ID],
      page: 1,
      size: 20,
    };

    // Act
    const result = await handler.execute({ ...query, currentUser: { tenantId: TEST_TENANT_ID } });

    // Assert
    expect(result).toBeDefined(); // AC_IT_01
  });

  it('AC_IT_02: return successful message when: <productCategoryAncestors> is <valid value> and <activeStatuses> is <valid value>', async () => {
    // Arrange
    const { GetListProductCategoryQueryHandler } = await import('../../../../components/product-catalog/application/queries/get-list-product-category.query-handler');
    const handler = moduleRef.get<any>(GetListProductCategoryQueryHandler);
    expect(handler).toBeDefined();

    const query = {
      productCategoryName: '123',
      activeStatuses: [0],
      productCategoryAncestors: [TEST_PARENT_CATEGORY_ID],
      page: 1,
      size: 20,
    };

    // Act
    const result = await handler.execute({ ...query, currentUser: { tenantId: TEST_TENANT_ID } });

    // Assert
    expect(result).toBeDefined(); // AC_IT_02
  });
});