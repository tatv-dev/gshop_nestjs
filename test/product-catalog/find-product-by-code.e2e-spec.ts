// test/product-catalog/find-product-by-code.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductCatalogModule } from '../../src/components/product-catalog/product-catalog.module';
import { ProductModel } from '../../src/components/product-catalog/infrastructure/entities/product.model';
import { ProductCategoryModel } from '../../src/components/product-catalog/infrastructure/entities/product-category.model';
import { TenantModel } from '../../src/components/authentication/infrastructure/entities/tenant.model';
import { AllExceptionsFilter } from '../../src/shared/application/filters/http-exception.filter';
import { JwtModule } from '@nestjs/jwt';

/**
 * E2E Test - Find Product by Code API
 * Tests full HTTP flow from request to response
 */
describe('FindProductByCode E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'test_db',
          entities: [ProductModel, ProductCategoryModel, TenantModel],
          synchronize: true,
          dropSchema: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        ProductCatalogModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Generate JWT token for testing
    const jwtService = moduleFixture.get('JwtService');
    jwtToken = await jwtService.signAsync({
      tenant_id: 1,
      employee_id: 1,
      permission: [],
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean data before each test
    await dataSource.getRepository(ProductModel).delete({});
    await dataSource.getRepository(ProductCategoryModel).delete({});
    await dataSource.getRepository(TenantModel).delete({});
  });

  /**
   * Seed test data
   */
  async function seedTestData(): Promise<void> {
    const tenantRepo = dataSource.getRepository(TenantModel);
    const categoryRepo = dataSource.getRepository(ProductCategoryModel);
    const productRepo = dataSource.getRepository(ProductModel);

    await tenantRepo.save([
      { id: 1, name: 'Test Tenant 1', status: 1 },
      { id: 2, name: 'Test Tenant 2', status: 1 },
    ]);

    await categoryRepo.save([
      { id: 1, name: 'Electronics', tenant_id: 1, active_status: 1 },
      { id: 2, name: 'Books', tenant_id: 2, active_status: 1 },
    ]);

    await productRepo.save([
      {
        id: 1,
        product_code: 'PROD-001',
        product_name: 'Product 1',
        description: 'Description 1',
        price: 100.5,
        unit: 'pcs',
        category_id: 1,
        tenant_id: 1,
        active_status: 1,
      },
      {
        id: 3,
        product_code: 'PROD-003',
        product_name: 'Product 3',
        description: 'Description 3',
        price: 300.0,
        unit: 'pcs',
        category_id: 2,
        tenant_id: 2,
        active_status: 1,
      },
    ]);
  }

  describe('AC_E2E_01: GET /api/v1/product-catalog/find-product-code with valid JWT', () => {
    it('[PASS] should return 200 OK with product data', async () => {
      // Arrange
      await seedTestData();

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'PROD-001' })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('productId', 1);
      expect(response.body.data).toHaveProperty('productCode', 'PROD-001');
      expect(response.body.data).toHaveProperty('productName', 'Product 1');
      expect(response.body.data).toHaveProperty('price', 100.5);
      expect(response.body.data).toHaveProperty('categoryName', 'Electronics');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('AC_E2E_02: GET /api/v1/product-catalog/find-product-code with invalid code', () => {
    it('[FAIL] should return 404 NOT_FOUND when product does not exist', async () => {
      // Arrange
      await seedTestData();

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'INVALID-CODE' })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'PRODUCT_NOT_FOUND');
      expect(response.body.error).toContain('INVALID-CODE');
    });
  });

  describe('AC_E2E_03: GET /api/v1/product-catalog/find-product-code with empty productCode', () => {
    it('[FAIL] should return 400 BAD_REQUEST with validation error', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: '' })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('AC_E2E_04: GET /api/v1/product-catalog/find-product-code missing productCode', () => {
    it('[FAIL] should return 400 BAD_REQUEST when productCode param is missing', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        // No query params
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('AC_E2E_05: GET /api/v1/product-catalog/find-product-code without JWT', () => {
    it('[FAIL] should return 401 UNAUTHORIZED without JWT token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'PROD-001' })
        // No Authorization header
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });
  });

  describe('AC_E2E_06: Tenant isolation', () => {
    it('[FAIL] should return 404 when trying to access product from different tenant', async () => {
      // Arrange
      await seedTestData();

      // User with tenantId=1 trying to access product from tenantId=2
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'PROD-003' }) // This belongs to tenant 2
        .set('Authorization', `Bearer ${jwtToken}`) // JWT has tenant_id=1
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'PRODUCT_NOT_FOUND');
    });

    it('[PASS] should find product only with correct tenantId', async () => {
      // Arrange
      await seedTestData();

      // Generate JWT for tenant 2
      const jwtService = app.get('JwtService');
      const tenant2Token = await jwtService.signAsync({
        tenant_id: 2,
        employee_id: 2,
        permission: [],
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'PROD-003' })
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.productCode).toBe('PROD-003');
    });
  });

  describe('AC_E2E_07: Invalid productCode format', () => {
    it('[FAIL] should return 400 with validation error for invalid characters', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/product-catalog/find-product-code')
        .query({ productCode: 'PROD@001' }) // @ is invalid
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
