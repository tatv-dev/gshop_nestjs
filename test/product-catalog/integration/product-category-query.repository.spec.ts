// test/product-catalog/integration/product-category-query.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryQueryRepository } from '../../../src/components/product-catalog/infrastructure/repositories/product-category-query.repository';
import { ProductCategoryModel } from '../../../src/components/product-catalog/infrastructure/entities/product-category.model';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ProductCategoryQueryRepository (Integration)', () => {
  let repository: ProductCategoryQueryRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mariadb',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', ''),
            database: configService.get('DB_DATABASE', 'test_db'),
            entities: [ProductCategoryModel],
            synchronize: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([ProductCategoryModel]),
      ],
      providers: [
        ProductCategoryQueryRepository,
      ],
    }).compile();

    repository = module.get<ProductCategoryQueryRepository>(ProductCategoryQueryRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
      expect(repository.findAll).toBeDefined();
    });

    it('should return array', async () => {
      const result = await repository.findAll('100');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by tenantId', async () => {
      const result = await repository.findAll('100');
      result.forEach((category) => {
        expect(category.tenantId).toBe('100');
      });
    });

    it('should filter by productCategoryName (search)', async () => {
      const result = await repository.findAll('100', 'Elect');
      result.forEach((category) => {
        expect(category.getName().toLowerCase()).toContain('elect');
      });
    });

    it('should filter by activeStatuses', async () => {
      const result = await repository.findAll('100', undefined, [1]);
      result.forEach((category) => {
        expect(category.activeStatus).toBe(1);
      });
    });

    it('should filter by productCategoryAncestors', async () => {
      const result = await repository.findAll('100', undefined, undefined, ['1']);
      result.forEach((category) => {
        const ancestry = category.getAncestryPath();
        expect(ancestry.includes('1')).toBe(true);
      });
    });

    it('should apply pagination', async () => {
      const result = await repository.findAll('100', undefined, undefined, undefined, 1, 5);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('count', () => {
    it('should return number', async () => {
      const result = await repository.count('100');
      expect(typeof result).toBe('number');
    });

    it('should count with filters', async () => {
      const totalCount = await repository.count('100');
      const filteredCount = await repository.count('100', undefined, [1]);
      expect(filteredCount).toBeLessThanOrEqual(totalCount);
    });
  });
});
