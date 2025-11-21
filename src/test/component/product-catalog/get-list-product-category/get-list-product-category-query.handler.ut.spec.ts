/**
 * Unit Tests for GetListProductCategoryQueryHandler
 * Test Suite: GetListProductCategory
 * Layer: Application
 * Type: UTQueryHandler
 *
 * RED CODE: Tests will FAIL until GetListProductCategoryQueryHandler is implemented
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GetListProductCategoryQueryHandler } from '@/components/product-catalog/application/queries/get-list-product-category.handler';
import { GetListProductCategoryQuery } from '@/components/product-catalog/application/queries/get-list-product-category.query';
import { IGetListProductCategoryQueryRepository } from '@/components/product-catalog/application/repositories/i-get-list-product-category-query.repository';

describe('GetListProductCategoryQueryHandler - Unit Tests', () => {
  let handler: GetListProductCategoryQueryHandler;
  let mockRepository: jest.Mocked<IGetListProductCategoryQueryRepository>;

  beforeAll(async () => {
    mockRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IGetListProductCategoryQueryRepository',
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
        title: 'Pairwise: activeStatuses [0] + ancestors [1,2] - repo.find() called with correct DTO',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: [1, 2],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expectedRepoCall: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [0],
          productCategoryAncestors: [1, 2],
          tenantId: 11,
          page: 1,
          size: 20,
        },
        mockResponse: {
          total: 5,
          page: 1,
          size: 20,
          items: [
            {
              productCategoryId: 1,
              productCategoryName: 'Điện thoại 123 Test',
              productCategoryParentId: null,
              productCategoryGrandParentId: null,
              productCategoryGrandParentName: null,
              creatorName: 'Nguyen Van A',
              createdAt: new Date('2025-01-01T00:00:00Z'),
              activeStatus: 0,
            },
          ],
        },
      },
      {
        acId: 'AC_Pairwise_13',
        title: 'Pairwise: activeStatuses [1] - repo.find() called with correct DTO',
        input: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: undefined,
          tenantId: 11,
          page: 1,
          size: 20,
        },
        expectedRepoCall: {
          productCategoryName: 'Điện thoại 123',
          activeStatuses: [1],
          productCategoryAncestors: undefined,
          tenantId: 11,
          page: 1,
          size: 20,
        },
        mockResponse: {
          total: 10,
          page: 1,
          size: 20,
          items: [
            {
              productCategoryId: 2,
              productCategoryName: 'Điện thoại 123 Active',
              productCategoryParentId: 1,
              productCategoryGrandParentId: null,
              productCategoryGrandParentName: null,
              creatorName: 'Tran Thi B',
              createdAt: new Date('2025-01-02T00:00:00Z'),
              activeStatus: 1,
            },
          ],
        },
      },
    ];

    it.each(interfaceRuleCases)('[$acId] $title', async ({ acId, input, expectedRepoCall, mockResponse }) => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockResponse);

      const query = new GetListProductCategoryQuery(
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.tenantId,
        input.page,
        input.size,
      );

      // Act
      const result = await handler.execute(query);

      // Assert - Interface Rule: verify repo.find() was called with correct DTO
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          productCategoryName: expectedRepoCall.productCategoryName,
          activeStatuses: expectedRepoCall.activeStatuses,
          tenantId: expectedRepoCall.tenantId,
          page: expectedRepoCall.page,
          size: expectedRepoCall.size,
        }),
      );

      // Assert - Mapping Rule: verify response DTO structure
      expect(result).toBeDefined();
      expect(result.total).toBe(mockResponse.total);
      expect(result.page).toBe(mockResponse.page);
      expect(result.size).toBe(mockResponse.size);
      expect(Array.isArray(result.productCategories)).toBe(true);

      if (result.productCategories.length > 0) {
        const firstItem = result.productCategories[0];
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

  describe('Mapping Rule Tests - Response DTO Structure', () => {
    it('should map repository response to correct response DTO structure', async () => {
      // Arrange
      const mockRepoResponse = {
        total: 3,
        page: 1,
        size: 20,
        items: [
          {
            productCategoryId: 1,
            productCategoryName: 'Category 1',
            productCategoryParentId: null,
            productCategoryGrandParentId: null,
            productCategoryGrandParentName: null,
            creatorName: 'Creator 1',
            createdAt: new Date('2025-01-01'),
            activeStatus: 1,
          },
          {
            productCategoryId: 2,
            productCategoryName: 'Category 2',
            productCategoryParentId: 1,
            productCategoryGrandParentId: null,
            productCategoryGrandParentName: 'Category 1',
            creatorName: 'Creator 2',
            createdAt: new Date('2025-01-02'),
            activeStatus: 0,
          },
        ],
      };

      mockRepository.find.mockResolvedValue(mockRepoResponse);

      const query = new GetListProductCategoryQuery('Test', [1], [1], 11, 1, 20);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual({
        total: 3,
        page: 1,
        size: 20,
        productCategories: expect.arrayContaining([
          expect.objectContaining({
            productCategoryId: expect.any(Number),
            productCategoryName: expect.any(String),
            creatorName: expect.any(String),
            createdAt: expect.any(Date),
            activeStatus: expect.any(Number),
          }),
        ]),
      });
    });

    it('should return empty array when no results found', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue({
        total: 0,
        page: 1,
        size: 20,
        items: [],
      });

      const query = new GetListProductCategoryQuery('NonExistent', [], [], 11, 1, 20);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.total).toBe(0);
      expect(result.productCategories).toEqual([]);
    });
  });
});
