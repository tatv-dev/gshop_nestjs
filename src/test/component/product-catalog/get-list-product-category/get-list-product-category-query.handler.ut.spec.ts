/**
 * Unit Tests for GetListProductCategoryQueryHandler
 * Test Suite: GetListProductCategory
 * Layer: Application
 * Type: UTQueryHandler
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GetListProductCategoryQueryHandler } from '@/components/product-catalog/application/handlers/get-list-product-category.handler';
import { GetListProductCategoryQuery } from '@/components/product-catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '@/components/product-catalog/application/dtos/get-list-product-category.dto';
import { IProductCategoryQueryRepository } from '@/components/product-catalog/application/repositories/product-category-query.repository';
import { ProductCategoryModel } from '@/components/product-catalog/infrastructure/entities/product-category.model';

describe('GetListProductCategoryQueryHandler - Unit Tests', () => {
  let handler: GetListProductCategoryQueryHandler;
  let mockRepository: jest.Mocked<IProductCategoryQueryRepository>;

  beforeAll(async () => {
    mockRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IProductCategoryQueryRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetListProductCategoryQueryHandler>(GetListProductCategoryQueryHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Interface Rule Tests - Repository Method Calls', () => {
    const interfaceRuleCases = [
      {
        acId: 'AC_Pairwise_12',
        title: 'Pairwise: activeStatuses [0] + ancestors [1,2] - repo called with correct params',
        input: {
          tenantId: 11,
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: [1, 2],
          page: 1,
          size: 20,
        },
        mockModels: [
          { id: 1, name: 'Test Category', tenant_id: 11, active_status: 0, level: 1, product_category_parent_id: null, parent_level1_id: null, parent_level2_id: null, creator_id: 1 } as ProductCategoryModel,
        ],
        mockCount: 1,
      },
      {
        acId: 'AC_Pairwise_13',
        title: 'Pairwise: activeStatuses [1] - repo called with correct params',
        input: {
          tenantId: 11,
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          page: 1,
          size: 20,
        },
        mockModels: [
          { id: 2, name: 'Active Category', tenant_id: 11, active_status: 1, level: 1, product_category_parent_id: null, parent_level1_id: null, parent_level2_id: null, creator_id: 1 } as ProductCategoryModel,
        ],
        mockCount: 1,
      },
    ];

    it.each(interfaceRuleCases)('[$acId] $title', async ({ acId, input, mockModels, mockCount }) => {
      // Arrange
      mockRepository.findAll.mockResolvedValue(mockModels);
      mockRepository.count.mockResolvedValue(mockCount);

      const dto = new GetListProductCategoryDTO(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.page,
        input.size,
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert - Interface Rule: verify repo methods were called
      expect(mockRepository.count).toHaveBeenCalledTimes(1);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);

      expect(mockRepository.count).toHaveBeenCalledWith(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
      );

      // Assert - Mapping Rule: verify response DTO structure
      expect(result).toBeDefined();
      expect(result.total).toBe(mockCount);
      expect(result.page).toBe(input.page);
      expect(result.size).toBe(input.size);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Mapping Rule Tests - Response DTO Structure', () => {
    it('should map repository models to correct response DTO structure', async () => {
      // Arrange
      const mockModels: ProductCategoryModel[] = [
        { id: 1, name: 'Category 1', tenant_id: 11, active_status: 1, level: 1, product_category_parent_id: null, parent_level1_id: null, parent_level2_id: null, creator_id: 1 } as ProductCategoryModel,
      ];
      mockRepository.findAll.mockResolvedValue(mockModels);
      mockRepository.count.mockResolvedValue(1);

      const dto = new GetListProductCategoryDTO(11, 'Test', [1], [1], 1, 20);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data.length).toBe(1);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('tenantId');
      expect(result.data[0]).toHaveProperty('activeStatus');
    });

    it('should return empty array when no results found', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const dto = new GetListProductCategoryDTO(11, 'NonExistent', [], [], 1, 20);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });
});
