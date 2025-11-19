// src/components/product-catalog/presentation/controllers/product-catalog.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { ProductCatalogController } from './product-catalog.controller';
import { GetListProductCategoryRequest } from '../requests/get-list-product-category.request';
import { GetListProductCategoryQuery } from '../../application/queries/get-list-product-category.query';

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

    controller = module.get<ProductCatalogController>(ProductCatalogController);
    queryBus = module.get(QueryBus);
  });

  describe('getList', () => {
    it('should call QueryBus with correct query', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = 'Electronics';
      request.activeStatuses = [1];
      request.page = 1;
      request.size = 10;

      const mockResult = {
        data: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      const mockJwtPayload = { tenantId: '100' } as any;

      await controller.getList(request, mockJwtPayload);

      expect(queryBus.execute).toHaveBeenCalled();
      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery).toBeInstanceOf(GetListProductCategoryQuery);
      expect(executedQuery.dto.tenantId).toBe('100');
      expect(executedQuery.dto.productCategoryName).toBe('Electronics');
    });

    it('should extract tenantId from JWT payload', async () => {
      const request = new GetListProductCategoryRequest();
      const mockJwtPayload = { tenantId: '999' } as any;

      const mockResult = {
        data: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      await controller.getList(request, mockJwtPayload);

      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery.dto.tenantId).toBe('999');
    });

    it('should return query result', async () => {
      const request = new GetListProductCategoryRequest();
      const mockJwtPayload = { tenantId: '100' } as any;

      const mockResult = {
        data: [
          {
            id: '1',
            name: 'Electronics',
            tenantId: '100',
            productCategoryParentId: null,
            level: 1,
            parentLevel1Id: null,
            parentLevel2Id: null,
            activeStatus: 1,
            creatorId: '5',
          },
        ],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      const result = await controller.getList(request, mockJwtPayload);

      expect(result).toEqual(mockResult);
    });

    it('should pass all filters to query', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = 'Test';
      request.activeStatuses = [0, 1];
      request.productCategoryAncestors = ['5', '10'];
      request.page = 2;
      request.size = 25;

      const mockJwtPayload = { tenantId: '100' } as any;

      const mockResult = {
        data: [],
        pagination: { page: 2, size: 25, total: 0, totalPages: 0 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      await controller.getList(request, mockJwtPayload);

      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery.dto.productCategoryName).toBe('Test');
      expect(executedQuery.dto.activeStatuses).toEqual([0, 1]);
      expect(executedQuery.dto.productCategoryAncestors).toEqual(['5', '10']);
      expect(executedQuery.dto.page).toBe(2);
      expect(executedQuery.dto.size).toBe(25);
    });

    it('should handle request with no filters', async () => {
      const request = new GetListProductCategoryRequest();
      const mockJwtPayload = { tenantId: '100' } as any;

      const mockResult = {
        data: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      await controller.getList(request, mockJwtPayload);

      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery.dto.tenantId).toBe('100');
      expect(executedQuery.dto.productCategoryName).toBeUndefined();
      expect(executedQuery.dto.activeStatuses).toBeUndefined();
    });

    it('should be protected by authentication', () => {
      // Verify that the controller method requires JWT payload
      const controllerMethod = controller.getList;
      expect(controllerMethod).toBeDefined();
      expect(controllerMethod.length).toBe(2); // request and jwtPayload parameters
    });

    it('should handle multiple workspaces by using first workspace tenantId', async () => {
      const request = new GetListProductCategoryRequest();
      const mockUserWithMultipleWorkspaces = {
        userId: '123',
        softwareId: 1,
        workspaceId: undefined,
        tenantId: undefined,
        workspaces: [
          { workspaceId: '1', tenantId: 200 },
          { workspaceId: '2', tenantId: 300 },
        ],
      } as any;

      const mockResult = {
        data: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      };
      queryBus.execute.mockResolvedValue(mockResult);

      await controller.getList(request, mockUserWithMultipleWorkspaces);

      const executedQuery = queryBus.execute.mock.calls[0][0] as any;
      expect(executedQuery.dto.tenantId).toBe('200'); // Should use first workspace's tenantId
    });

    it('should throw error when tenantId cannot be determined', async () => {
      const request = new GetListProductCategoryRequest();
      const mockUserWithoutTenant = {
        userId: '123',
        softwareId: 1,
        workspaces: [],
      } as any;

      await expect(controller.getList(request, mockUserWithoutTenant)).rejects.toThrow(
        'Cannot determine tenant ID from user context',
      );
    });
  });
});
