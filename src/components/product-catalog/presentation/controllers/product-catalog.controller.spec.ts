// src/components/product-catalog/presentation/controllers/product-catalog.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ProductCatalogController } from './product-catalog.controller';
import { FindProductByCodeRequest } from '../requests/find-product-by-code.request';
import { ProductNotFoundError } from '../../domain/errors/product.error';

describe('ProductCatalogController', () => {
  let controller: ProductCatalogController;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCatalogController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<ProductCatalogController>(
      ProductCatalogController,
    );
    queryBus = module.get(QueryBus);
  });

  describe('AC_PRES_02_01: Controller maps request to Query and calls QueryBus', () => {
    it('[PASS] should map request to FindProductByCodeQuery and execute via QueryBus', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      const mockUser = {
        tenant_id: 1,
        employee_id: 1,
        permission: [],
      };

      const mockHttpRequest: any = {
        user: mockUser,
      };

      const expectedResult = {
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Test Product',
        description: 'Test Description',
        price: 100.5,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        activeStatus: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      queryBus.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.findByCode(request, mockHttpRequest);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledTimes(1);
      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery).toBeDefined();
      expect(executedQuery.productCode).toBe('PROD-001');
      expect(executedQuery.tenantId).toBe(1);
    });
  });

  describe('AC_PRES_02_02: Controller returns 200 with product data', () => {
    it('[PASS] should return 200 with product data when found', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      const mockUser = {
        tenant_id: 1,
        employee_id: 1,
        permission: [],
      };

      const mockHttpRequest: any = {
        user: mockUser,
      };

      const mockProductData = {
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Test Product',
        description: 'Test Description',
        price: 100.5,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        activeStatus: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      queryBus.execute.mockResolvedValue(mockProductData);

      // Act
      const result = await controller.findByCode(request, mockHttpRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProductData);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('AC_PRES_02_03: Controller returns 404 when product not found', () => {
    it('[PASS] should throw NotFoundException when product not found', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'INVALID-CODE';

      const mockUser = {
        tenant_id: 1,
        employee_id: 1,
        permission: [],
      };

      const mockHttpRequest: any = {
        user: mockUser,
      };

      queryBus.execute.mockRejectedValue(
        new ProductNotFoundError('INVALID-CODE'),
      );

      // Act & Assert
      await expect(
        controller.findByCode(request, mockHttpRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('AC_PRES_02_04: Controller extracts tenantId from JWT token', () => {
    it('[PASS] should extract tenantId from request.user (JWT payload)', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      const mockUser = {
        tenant_id: 99,
        employee_id: 1,
        permission: [],
      };

      const mockHttpRequest: any = {
        user: mockUser,
      };

      queryBus.execute.mockResolvedValue({});

      // Act
      await controller.findByCode(request, mockHttpRequest);

      // Assert
      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery.tenantId).toBe(99);
    });

    it('[PASS] should handle missing user in request', async () => {
      // Arrange
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      const mockHttpRequest: any = {
        // user is undefined
      };

      // Act & Assert
      await expect(
        controller.findByCode(request, mockHttpRequest),
      ).rejects.toThrow();
    });
  });

  describe('AC_PRES_02_05: Controller handles various error scenarios', () => {
    it('[PASS] should propagate domain errors', async () => {
      const request = new FindProductByCodeRequest();
      request.productCode = 'PROD-001';

      const mockUser = {
        tenant_id: 1,
        employee_id: 1,
        permission: [],
      };

      const mockHttpRequest: any = {
        user: mockUser,
      };

      const domainError = new Error('Some domain error');
      queryBus.execute.mockRejectedValue(domainError);

      await expect(
        controller.findByCode(request, mockHttpRequest),
      ).rejects.toThrow('Some domain error');
    });
  });
});
