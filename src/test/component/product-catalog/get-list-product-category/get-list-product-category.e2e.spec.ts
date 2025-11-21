/**
 * End-to-End Tests for GetListProductCategory
 * Test Suite: GetListProductCategory
 * Layer: Contract (Presentation)
 * Type: E2E
 *
 * RED CODE: Tests will FAIL until the full stack is implemented
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

  // Test tokens (should be configured via environment or test setup)
  const VALID_TOKEN = process.env.TEST_VALID_TOKEN || 'test_valid_token';
  const NO_SCOPE_TOKEN = process.env.TEST_NO_SCOPE_TOKEN || 'test_no_scope_token';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
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
    await app.close();
  });

  describe('Happy Path Tests', () => {
    const happyPathCases = [
      {
        acId: 'AC_E2E_01',
        title: '[E2E-Happy path (có data)]Truy vấn danh mục theo tên + trạng thái + ancestor',
        input: {
          auth: { access_token: VALID_TOKEN },
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1, 0],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          status: 200,
          body: {
            page: 1,
            size: 20,
          },
        },
      },
      {
        acId: 'AC_E2E_02',
        title: '[E2E-Happy path (không data)]Tìm với điều kiện hợp lệ nhưng không khớp',
        input: {
          auth: { access_token: VALID_TOKEN },
          productCategoryName: 'Tên danh mục không tồn tại XYZ',
          activeStatuses: [],
          productCategoryAncestors: [],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          status: 200,
          body: {
            total: 0,
            page: 1,
            size: 20,
            items: [],
          },
        },
      },
    ];

    it.each(happyPathCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange & Act
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${input.auth.access_token}`)
        .query({
          productCategoryName: input.productCategoryName,
          activeStatuses: input.activeStatuses,
          productCategoryAncestors: input.productCategoryAncestors,
          tenantId: input.tenantId,
          page: input.page,
          size: input.size,
        });

      // Assert
      expect(response.status).toBe(expected.status);
      expect(response.body.page).toBe(expected.body.page);
      expect(response.body.size).toBe(expected.body.size);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.body.items)).toBe(true);

      if (expected.body.total !== undefined) {
        expect(response.body.total).toBe(expected.body.total);
      }

      if (expected.body.items !== undefined) {
        expect(response.body.items).toEqual(expected.body.items);
      }

      // Verify response structure for non-empty results
      if (response.body.items.length > 0) {
        const firstItem = response.body.items[0];
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

  describe('Validation Error Tests (422)', () => {
    const validationErrorCases = [
      {
        acId: 'AC_E2E_03',
        title: '[E2E-Validation 422]Input sai định dạng - productCategoryName empty',
        input: {
          auth: { access_token: VALID_TOKEN },
          productCategoryName: '',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          status: 422,
          body: {
            type: 'about:blank',
            code: 'VALIDATION_ERROR',
            title: 'Validation Failed',
            detail: 'Dữ liệu đầu vào không hợp lệ.',
            errors: [
              {
                field: 'productCategoryName',
                code: 'empty_or_blank',
                message: 'Trường productCategoryName không được rỗng hoặc chỉ chứa khoảng trắng.',
              },
            ],
          },
        },
      },
    ];

    it.each(validationErrorCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange & Act
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${input.auth.access_token}`)
        .query({
          productCategoryName: input.productCategoryName,
          activeStatuses: input.activeStatuses,
          productCategoryAncestors: input.productCategoryAncestors,
          tenantId: input.tenantId,
          page: input.page,
          size: input.size,
        });

      // Assert
      expect(response.status).toBe(expected.status);
      expect(response.body.code).toBe(expected.body.code);
      expect(response.body.title).toBe(expected.body.title);
      expect(response.body.detail).toBe(expected.body.detail);
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);

      const expectedError = expected.body.errors[0];
      const actualError = response.body.errors.find((e: { field: string }) => e.field === expectedError.field);
      expect(actualError).toBeDefined();
      expect(actualError.code).toBe(expectedError.code);
    });
  });

  describe('Authentication Error Tests (401)', () => {
    const authErrorCases = [
      {
        acId: 'AC_E2E_04',
        title: '[E2E-Unauthorized 401]Không đăng nhập/Token không hợp lệ',
        input: {
          auth: { access_token: null },
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          status: 401,
          body: {
            type: 'about:blank',
            code: 'AUTH_INVALID_TOKEN',
            title: 'Authentication Required',
            detail: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
            errors: [],
          },
        },
      },
    ];

    it.each(authErrorCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange & Act
      let req = request(app.getHttpServer()).get('/api/product-categories').query({
        productCategoryName: input.productCategoryName,
        activeStatuses: input.activeStatuses,
        productCategoryAncestors: input.productCategoryAncestors,
        tenantId: input.tenantId,
        page: input.page,
        size: input.size,
      });

      if (input.auth.access_token) {
        req = req.set('Authorization', `Bearer ${input.auth.access_token}`);
      }

      const response = await req;

      // Assert
      expect(response.status).toBe(expected.status);
      expect(response.body.code).toBe(expected.body.code);
      expect(response.body.title).toBe(expected.body.title);
      expect(response.body.detail).toBe(expected.body.detail);
    });
  });

  describe('Authorization Error Tests (403)', () => {
    const forbiddenErrorCases = [
      {
        acId: 'AC_E2E_05',
        title: '[E2E-Forbidden 403]Đăng nhập không đủ quyền/sai scope',
        input: {
          auth: { access_token: NO_SCOPE_TOKEN },
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: [1],
          tenantId: TEST_TENANT_ID,
          page: 1,
          size: 20,
        },
        expected: {
          status: 403,
          body: {
            type: 'about:blank',
            code: 'PERMISSION_DENIED',
            title: 'Access Denied',
            detail: 'Bạn không có quyền thực hiện hành động này.',
            errors: [],
          },
        },
      },
    ];

    it.each(forbiddenErrorCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange & Act
      const response = await request(app.getHttpServer())
        .get('/api/product-categories')
        .set('Authorization', `Bearer ${input.auth.access_token}`)
        .query({
          productCategoryName: input.productCategoryName,
          activeStatuses: input.activeStatuses,
          productCategoryAncestors: input.productCategoryAncestors,
          tenantId: input.tenantId,
          page: input.page,
          size: input.size,
        });

      // Assert
      expect(response.status).toBe(expected.status);
      expect(response.body.code).toBe(expected.body.code);
      expect(response.body.title).toBe(expected.body.title);
      expect(response.body.detail).toBe(expected.body.detail);
    });
  });
});
