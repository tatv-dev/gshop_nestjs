/**
 * End-to-End Tests for GetListProductCategory
 * Test Suite: GetListProductCategory
 * Layer: Contract (Presentation)
 * Type: E2E
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { seedProductCategoryTestData, TEST_TENANT_ID } from '@/test/helpers/seed-data.helper';

describe('GetListProductCategory - E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const VALID_TOKEN = process.env.TEST_VALID_TOKEN || 'test_valid_token';
  const NO_SCOPE_TOKEN = process.env.TEST_NO_SCOPE_TOKEN || 'test_no_scope_token';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);
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
    await app.close();
  });

  describe('Happy Path Tests', () => {
    it('[AC_E2E_01] Happy path (có data) - Truy vấn danh mục theo tên + trạng thái + ancestor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1, 0],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('size', 20);
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('[AC_E2E_02] Happy path (không data) - Tìm với điều kiện hợp lệ nhưng không khớp', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .query({
          productCategoryName: 'Tên danh mục không tồn tại XYZ',
          activeStatuses: [],
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('Validation Error Tests (422)', () => {
    it('[AC_E2E_03] Validation 422 - Input sai định dạng', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .query({
          productCategoryName: '',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('Authentication Error Tests (401)', () => {
    it('[AC_E2E_04] Unauthorized 401 - Không đăng nhập/Token không hợp lệ', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Error Tests (403)', () => {
    it('[AC_E2E_05] Forbidden 403 - Đăng nhập không đủ quyền/sai scope', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${NO_SCOPE_TOKEN}`)
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(403);
    });
  });
});
