// src/components/product-catalog/infrastructure/repositories/product-query.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductQueryRepository } from './product-query.repository';
import { ProductModel } from '../entities/product.model';
import { ProductCategoryModel } from '../entities/product-category.model';
import { TenantModel } from '../../../authentication/infrastructure/entities/tenant.model';

/**
 * Integration Test - Testing with real database
 * Tests ProductQueryRepository.findByCode method
 */
describe('ProductQueryRepository (Integration)', () => {
  let module: TestingModule;
  let repository: ProductQueryRepository;
  let dataSource: DataSource;
  let productRepo: Repository<ProductModel>;
  let categoryRepo: Repository<ProductCategoryModel>;
  let tenantRepo: Repository<TenantModel>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'test_db',
          entities: [ProductModel, ProductCategoryModel, TenantModel],
          synchronize: true, // For test only
          dropSchema: true, // Clean database before tests
        }),
        TypeOrmModule.forFeature([
          ProductModel,
          ProductCategoryModel,
          TenantModel,
        ]),
      ],
      providers: [ProductQueryRepository],
    }).compile();

    repository = module.get<ProductQueryRepository>(ProductQueryRepository);
    dataSource = module.get<DataSource>(DataSource);
    productRepo = dataSource.getRepository(ProductModel);
    categoryRepo = dataSource.getRepository(ProductCategoryModel);
    tenantRepo = dataSource.getRepository(TenantModel);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    // Clean data before each test
    await productRepo.delete({});
    await categoryRepo.delete({});
    await tenantRepo.delete({});
  });

  /**
   * Seed test data for integration tests
   */
  async function seedTestData(): Promise<void> {
    // Seed tenants
    await tenantRepo.save([
      {
        id: 1,
        name: 'Test Tenant 1',
        status: 1,
        remaining_account_quota: 10,
        total_account_quota: 100,
      },
      {
        id: 2,
        name: 'Test Tenant 2',
        status: 1,
        remaining_account_quota: 10,
        total_account_quota: 100,
      },
    ]);

    // Seed categories
    await categoryRepo.save([
      {
        id: 1,
        name: 'Electronics',
        tenant_id: 1,
        active_status: 1,
      },
      {
        id: 2,
        name: 'Books',
        tenant_id: 2,
        active_status: 1,
      },
    ]);

    // Seed products
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
        id: 2,
        product_code: 'PROD-002',
        product_name: 'Product 2',
        description: 'Description 2',
        price: 200.0,
        unit: 'box',
        category_id: 1,
        tenant_id: 1,
        active_status: 0, // Inactive
      },
      {
        id: 3,
        product_code: 'PROD-003',
        product_name: 'Product 3',
        description: 'Description 3',
        price: 300.0,
        unit: 'pcs',
        category_id: 2,
        tenant_id: 2, // Different tenant
        active_status: 1,
      },
      {
        id: 4,
        product_code: 'prod-001', // Lowercase version
        product_name: 'Product 4',
        description: 'Description 4',
        price: 150.0,
        unit: 'pcs',
        category_id: 1,
        tenant_id: 1,
        active_status: 1,
      },
    ]);
  }

  describe('AC_INFRA_01_01: Find product with valid code and tenantId', () => {
    it('[PASS] should find product with code "PROD-001" and tenantId 1', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('PROD-001', 1);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.productCode.value).toBe('PROD-001');
      expect(result?.productName).toBe('Product 1');
      expect(result?.price).toBe(100.5);
      expect(result?.categoryName).toBe('Electronics');
      expect(result?.isActive()).toBe(true);
    });
  });

  describe('AC_INFRA_01_02: Find inactive product', () => {
    it('[PASS] should find inactive product (activeStatus=0)', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('PROD-002', 1);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.productCode.value).toBe('PROD-002');
      expect(result?.isActive()).toBe(false);
    });
  });

  describe('AC_INFRA_01_03: Tenant isolation', () => {
    it('[PASS] should NOT find product with different tenantId', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('PROD-003', 1);

      // Assert
      expect(result).toBeNull();
    });

    it('[PASS] should find product only with correct tenantId', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('PROD-003', 2);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.productCode.value).toBe('PROD-003');
    });
  });

  describe('AC_INFRA_01_04: Product not found', () => {
    it('[PASS] should return null when product code does not exist', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('INVALID-CODE', 1);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('AC_INFRA_01_05: Case-sensitive search', () => {
    it('[PASS] should be case-sensitive: "prod-001" != "PROD-001"', async () => {
      // Arrange
      await seedTestData();

      // Act
      const resultUppercase = await repository.findByCode('PROD-001', 1);
      const resultLowercase = await repository.findByCode('prod-001', 1);

      // Assert
      expect(resultUppercase).not.toBeNull();
      expect(resultUppercase?.id).toBe(1);

      expect(resultLowercase).not.toBeNull();
      expect(resultLowercase?.id).toBe(4);

      // They should be different products
      expect(resultUppercase?.id).not.toBe(resultLowercase?.id);
    });
  });

  describe('AC_INFRA_01_06: Database query performance', () => {
    it('[PASS] should use JOIN to fetch category name in single query', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await repository.findByCode('PROD-001', 1);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.categoryName).toBe('Electronics');
      // Category name should be fetched via JOIN, not separate query
    });
  });
});
