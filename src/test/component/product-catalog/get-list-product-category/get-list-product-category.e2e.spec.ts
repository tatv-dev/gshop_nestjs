import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DatabaseHelper } from '../test-helpers/database.helper';
import { SeedDataHelper } from '../test-helpers/seed-data.helper';
// RED CODE: Main module not defined
import { ProductCatalogModule } from '../../../../components/product-catalog/product-catalog.module'; 

/**
 * Layer: E2E
 * Type: E2E Test
 * Focus: HTTP status codes, JSON response structure, Auth simulation (mock guard if needed), Exception filters.
 */
describe('GetListProductCategory (E2E)', () => {
  let app: INestApplication;
  let queryRunner: any;

  beforeAll(async () => {
    await DatabaseHelper.initialize();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductCatalogModule], // Loads the real module
    })
    .overrideProvider('DATABASE_CONNECTION') // Hypothethical override if using DI for connection
    .useValue(await DatabaseHelper.initialize())
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await DatabaseHelper.close();
  });

  beforeEach(async () => {
    queryRunner = await DatabaseHelper.getQueryRunner();
    await SeedDataHelper.seedProductCategories(queryRunner);
  });

  afterEach(async () => {
    await DatabaseHelper.rollbackAndRelease(queryRunner);
  });

  const testCases = [
    {
      acId: 'AC_E2E_01',
      title: 'Happy Path - Get List Successfully',
      query: '?productCategoryName=Điện thoại&tenantId=11&page=1&size=20',
      expectedStatus: 200,
      checkBody: (body: any) => {
        expect(body.data.items).toBeInstanceOf(Array);
        expect(body.data.total).toBeGreaterThan(0);
      }
    },
    {
      acId: 'AC_E2E_03',
      title: 'Validation Error - Missing TenantId',
      query: '?productCategoryName=Điện thoại&page=1&size=20', // Missing tenantId
      expectedStatus: 422,
      checkBody: (body: any) => {
        expect(body.code).toBe('VALIDATION_ERROR');
        expect(body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: 'tenantId' })
          ])
        );
      }
    }
  ];

  test.each(testCases)('[$acId] $title', async ({ query, expectedStatus, checkBody }) => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/product-categories${query}`)
      .set('Authorization', 'Bearer valid_token'); // Mocking auth via headers or MockGuard

    expect(response.status).toBe(expectedStatus);
    checkBody(response.body);
  });
});