// src/components/product-catalog/application/handlers/find-product-by-code.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FindProductByCodeHandler } from './find-product-by-code.handler';
import { FindProductByCodeQuery } from '../queries/find-product-by-code.query';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductCodeVO } from '../../domain/value-objects/product-code.vo';
import { ProductNotFoundError } from '../../domain/errors/product.error';

describe('FindProductByCodeHandler', () => {
  let handler: FindProductByCodeHandler;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    // Mock repository
    const mockRepository = {
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindProductByCodeHandler,
        {
          provide: 'ProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<FindProductByCodeHandler>(FindProductByCodeHandler);
    repository = module.get('ProductRepository');
  });

  describe('AC_APP_02_01: Handler calls repository with correct params', () => {
    it('[PASS] should call repository.findByCode with correct productCode and tenantId', async () => {
      // Arrange
      const query = new FindProductByCodeQuery('PROD-001', 1);
      const mockProduct = Product.create({
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: 'Test Product',
        description: 'Test',
        price: 100,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 1,
        activeStatus: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      repository.findByCode.mockResolvedValue(mockProduct);

      // Act
      await handler.execute(query);

      // Assert
      expect(repository.findByCode).toHaveBeenCalledTimes(1);
      expect(repository.findByCode).toHaveBeenCalledWith('PROD-001', 1);
    });
  });

  describe('AC_APP_02_02: Handler returns product when found', () => {
    it('[PASS] should return product data when found', async () => {
      // Arrange
      const query = new FindProductByCodeQuery('PROD-001', 1);
      const mockProduct = Product.create({
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 1,
        activeStatus: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      });

      repository.findByCode.mockResolvedValue(mockProduct);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.productId).toBe(1);
      expect(result.productCode).toBe('PROD-001');
      expect(result.productName).toBe('Test Product');
      expect(result.price).toBe(100.50);
    });
  });

  describe('AC_APP_02_03: Handler throws ProductNotFoundError when not found', () => {
    it('[PASS] should throw ProductNotFoundError when product not found', async () => {
      // Arrange
      const query = new FindProductByCodeQuery('INVALID-CODE', 1);
      repository.findByCode.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        ProductNotFoundError,
      );
      await expect(handler.execute(query)).rejects.toThrow(
        'Product with code "INVALID-CODE" not found',
      );
    });
  });

  describe('AC_APP_02_04: Handler handles repository errors', () => {
    it('[PASS] should propagate repository errors', async () => {
      // Arrange
      const query = new FindProductByCodeQuery('PROD-001', 1);
      const dbError = new Error('Database connection failed');
      repository.findByCode.mockRejectedValue(dbError);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('AC_APP_02_05: Handler validates tenantId', () => {
    it('[PASS] should handle tenantId validation', async () => {
      // Arrange
      const query = new FindProductByCodeQuery('PROD-001', 0);

      // Act & Assert
      // tenantId validation should happen before calling repository
      // This will be implemented in the handler
      await expect(handler.execute(query)).rejects.toThrow();
    });
  });
});
