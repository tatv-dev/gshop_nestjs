/**
 * End-to-End Tests for GetListProductCategory
 * Test Suite: GetListProductCategory
 * Layer: Contract (Presentation)
 * Type: E2E
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../../app.module';
import { seedProductCategoryTestData, TEST_USER_CREDENTIALS } from '../../../helpers/seed-data.helper';

describe('GetListProductCategory - E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    // Seed data and login to get access token
    const seedRunner = dataSource.createQueryRunner();
    await seedRunner.connect();
    await seedProductCategoryTestData(seedRunner);
    await seedRunner.release();

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: TEST_USER_CREDENTIALS.username,
        password: TEST_USER_CREDENTIALS.password,
        softwareId: TEST_USER_CREDENTIALS.softwareId,
      });

    accessToken = loginResponse.body?.access_token || loginResponse.body?.data?.access_token || '';
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
        .get('/api/v1/product-catalog/product-categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1, 0],
          productCategoryAncestors: [1],
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
        .get('/api/v1/product-catalog/product-categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          productCategoryName: 'Tên danh mục không tồn tại XYZ',
          activeStatuses: [],
          productCategoryAncestors: [],
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
        .get('/api/v1/product-catalog/product-categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          productCategoryName: '',
          activeStatuses: [1],
          productCategoryAncestors: [1],
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
        .get('/api/v1/product-catalog/product-categories')
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Error Tests (403)', () => {
    it.skip('[AC_E2E_05] Forbidden 403 - Đăng nhập không đủ quyền/sai scope', async () => {
      // TODO: Requires a user without proper scope/permissions to be seeded
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/product-categories')
        .set('Authorization', 'Bearer invalid_scope_token')
        .query({
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          page: 1,
          size: 20,
        });

      expect(response.status).toBe(403);
    });
  });
});
