import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../../../app.module';
import {
  cleanup,
  seedProductCategoriesTestData,
  seedTestData,
  TEST_PARENT_CATEGORY_ID,
  TEST_USER_CREDENTIALS,
  TEST_USER_WITHOUT_PERMISSION_CREDENTIALS,
} from './get-list-product-category.seed';

describe('GET /api/v1/product-catalog/product-categories E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let accessTokenWithPermission: string;
  let accessTokenWithoutPermission: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: false,
        forbidUnknownValues: false,
      })
    );
    await app.init();

    dataSource = app.get(DataSource);
    await seedTestData(dataSource);

    // Login user with permission
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: TEST_USER_CREDENTIALS.username,
        password: TEST_USER_CREDENTIALS.password,
        softwareId: TEST_USER_CREDENTIALS.softwareId,
      });
    expect(loginRes.status).toBeLessThan(400);
    accessTokenWithPermission = loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
    expect(accessTokenWithPermission).toBeDefined();

    // Login user without permission
    const loginResNoScope = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: TEST_USER_WITHOUT_PERMISSION_CREDENTIALS.username,
        password: TEST_USER_WITHOUT_PERMISSION_CREDENTIALS.password,
        softwareId: TEST_USER_WITHOUT_PERMISSION_CREDENTIALS.softwareId,
      });
    expect(loginResNoScope.status).toBeLessThan(400);
    accessTokenWithoutPermission = loginResNoScope.body?.data?.accessToken || loginResNoScope.body?.accessToken;
    expect(accessTokenWithoutPermission).toBeDefined();
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
    await app.close();
  });

  it('AC_E2E_01: return successful response when user inputs valid data', async () => {
    // Arrange
    const query = {
      productCategoryName: 'Điện thoại 123',
      activeStatuses: JSON.stringify([1, 0]),
      productCategoryAncestors: JSON.stringify([TEST_PARENT_CATEGORY_ID]),
      page: 1,
      size: 20,
    };

    // Act
    const res = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .set('Authorization', `Bearer ${accessTokenWithPermission}`)
      .query(query);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.size).toBe(20);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('AC_E2E_02: return successful response when user inputs valid data but no data is matched', async () => {
    // Arrange
    const query = {
      productCategoryName: 'Tên danh mục không tồn tại XYZ',
      activeStatuses: [],
      productCategoryAncestors: [],
      page: 1,
      size: 20,
    };

    // Act
    const res = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .set('Authorization', `Bearer ${accessTokenWithPermission}`)
      .query(query);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.page).toBe(1);
    expect(res.body.size).toBe(20);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('AC_E2E_03: return error response when user inputs invalid data', async () => {
    // Arrange
    const query = {
      productCategoryName: "123",
      activeStatuses: 1,
      productCategoryAncestors: [TEST_PARENT_CATEGORY_ID],
      page: 1,
      size: 20,
    };

    // Act
    const res = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .set('Authorization', `Bearer ${accessTokenWithPermission}`)
      .query(query);

    // Assert
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('messageKey');
    expect(res.body.messageKey).toContain('validation_error');
    expect(Array.isArray(res.body.errors) || res.body.errors === undefined).toBe(true);
  });

  it('AC_E2E_04: return error response when Token is expired', async () => {
    // Arrange
    const query = {
      productCategoryName: 'Điện thoại 123',
      activeStatuses: [1],
      productCategoryAncestors: [TEST_PARENT_CATEGORY_ID],
      page: 1,
      size: 20,
    };

    // Act
    const res = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .query(query);

    // Assert
    expect(res.status).toBe(401);
  });

  it('AC_E2E_05: return error response when Permission is denied', async () => {
    // Arrange
    const query = {
      productCategoryName: 'Điện thoại 123',
      activeStatuses: [1],
      productCategoryAncestors: [TEST_PARENT_CATEGORY_ID],
      page: 1,
      size: 20,
    };

    // Act
    const res = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .set('Authorization', `Bearer ${accessTokenWithoutPermission}`)
      .query(query);

    // Assert
    expect(res.status).toBe(403);
  });
});