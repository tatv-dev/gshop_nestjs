import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { AppModule } from '../../../../app.module';
import {
  TEST_PARENT_CATEGORY_ID,
  TEST_TENANT_ID,
} from './get-list-product-category.seed';

describe('GetListProductCategoryQueryHandler Integration Tests', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // ⚠️ IMPORTANT: Data must be seeded before running tests
    // Run: npm run test:seed get-list-product-category

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    // ⚠️ Data cleanup is done via: npm run test:cleanup get-list-product-category
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