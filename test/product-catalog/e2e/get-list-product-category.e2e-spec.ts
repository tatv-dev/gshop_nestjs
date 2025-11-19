// test/product-catalog/e2e/get-list-product-category.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Get List Product Category (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

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

    // Authenticate to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/authentication/basic')
      .send({
        username: 'testuser',
        password: 'password123',
        softwareId: 1,
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/product-catalog/product-categories', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .expect(401);

      expect(response.body.title).toBe('Unauthorized');
    });

    it('should return list of product categories with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('size');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should filter by productCategoryName', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ productCategoryName: 'Electronics' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((category: any) => {
        expect(category.name.toLowerCase()).toContain('electronics');
      });
    });

    it('should filter by activeStatuses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ activeStatuses: [1] })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((category: any) => {
        expect(category.activeStatus).toBe(1);
      });
    });

    it('should apply pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ page: 1, size: 5 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.size).toBe(5);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ page: 0, size: 0 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.title).toBe('Bad Request');
    });

    it('should return 400 for invalid activeStatuses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ activeStatuses: [2, 3] })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.title).toBe('Bad Request');
    });

    it('should return 400 when productCategoryName exceeds max length', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ productCategoryName: 'A'.repeat(256) })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.title).toBe('Bad Request');
    });

    it('should handle multiple filters together', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({
          productCategoryName: 'Elect',
          activeStatuses: [1],
          page: 1,
          size: 10,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.size).toBe(10);
    });

    it('should filter by productCategoryAncestors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product-catalog/product-categories')
        .query({ productCategoryAncestors: ['1'] })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      // All returned categories should have ancestor ID '1' in their path
      response.body.data.forEach((category: any) => {
        const hasAncestor =
          category.parentLevel1Id === '1' || category.parentLevel2Id === '1';
        expect(hasAncestor).toBe(true);
      });
    });
  });
});
