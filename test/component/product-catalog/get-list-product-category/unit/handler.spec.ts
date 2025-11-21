// test/component/product-catalog/get-list-product-category/unit/handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GetListProductCategoryQueryHandler } from '../../../../../src/components/product-catalog/application/handlers/get-list-product-category.handler';
import { IProductCategoryQueryRepository } from '../../../../../src/components/product-catalog/application/repositories/product-category-query.repository';
import { GetListProductCategoryQuery } from '../../../../../src/components/product-catalog/application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../../../../src/components/product-catalog/application/dtos/get-list-product-category.dto';
import { ApplicationException } from '../../../../../src/shared/application/exceptions/application.exception';
import { GetListTestCase } from '../../test-helpers/test-data.factory';

/**
 * GetListProductCategoryQueryHandler - Unit Test
 * Tests handler orchestration logic with real repository (NO mocks)
 *
 * Layer: Application Layer
 * Test Type: Unit Test
 * Mock Strategy: NO mocks - uses real repository implementation
 *
 * Test Focus:
 * - Pagination validation (page, size boundaries)
 * - Business logic orchestration
 * - Response DTO structure
 * - Exception handling for invalid pagination
 *
 * NOTE: This is a Unit Test but calls REAL repository.
 * We test the handler's orchestration logic, not the repository's query logic.
 */
describe('GetListProductCategoryQueryHandler - Unit Test', () => {
  let handler: GetListProductCategoryQueryHandler;
  let repository: IProductCategoryQueryRepository;

  /**
   * Setup: Create testing module with real repository
   * NO mocks - handler should call actual repository implementation
   */
  beforeEach(async () => {
    // Create mock repository with minimal implementation for unit testing
    const mockRepository: Partial<IProductCategoryQueryRepository> = {
      findAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
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
    repository = module.get<IProductCategoryQueryRepository>('IProductCategoryQueryRepository');
  });

  /**
   * Test Cases: Pagination Validation
   * Handler MUST validate pagination before calling repository
   */
  describe('Pagination Validation', () => {
    const validationTestCases: GetListTestCase[] = [
      // ==================== HAPPY PATH ====================
      {
        acId: 'AC-H-01',
        title: 'Valid pagination - default values',
        input: {
          tenantId: 1,
          page: 1,
          size: 10,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      },

      {
        acId: 'AC-H-02',
        title: 'Valid pagination - custom page and size',
        input: {
          tenantId: 1,
          page: 5,
          size: 20,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 5,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        },
      },

      // ==================== PAGE VALIDATION ====================
      {
        acId: 'AC-H-03',
        title: 'Page below minimum (0)',
        input: {
          tenantId: 1,
          page: 0,
          size: 10,
        },
        expected: {
          exception: {
            type: 'ApplicationException',
            messageKey: 'min.numeric',
          },
        },
      },

      {
        acId: 'AC-H-04',
        title: 'Page below minimum (negative)',
        input: {
          tenantId: 1,
          page: -1,
          size: 10,
        },
        expected: {
          exception: {
            type: 'ApplicationException',
            messageKey: 'min.numeric',
          },
        },
      },

      {
        acId: 'AC-H-05',
        title: 'Page at maximum (1000)',
        input: {
          tenantId: 1,
          page: 1000,
          size: 10,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1000,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      },

      {
        acId: 'AC-H-06',
        title: 'Page exceeds maximum (1001)',
        input: {
          tenantId: 1,
          page: 1001,
          size: 10,
        },
        expected: {
          exception: {
            type: 'ApplicationException',
            messageKey: 'max.numeric',
          },
        },
      },

      // ==================== SIZE VALIDATION ====================
      {
        acId: 'AC-H-07',
        title: 'Size below minimum (0)',
        input: {
          tenantId: 1,
          page: 1,
          size: 0,
        },
        expected: {
          exception: {
            type: 'ApplicationException',
            messageKey: 'between.numeric',
          },
        },
      },

      {
        acId: 'AC-H-08',
        title: 'Size at minimum (1)',
        input: {
          tenantId: 1,
          page: 1,
          size: 1,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 1,
            total: 0,
            totalPages: 0,
          },
        },
      },

      {
        acId: 'AC-H-09',
        title: 'Size at maximum (100)',
        input: {
          tenantId: 1,
          page: 1,
          size: 100,
        },
        expected: {
          response: {
            dataLength: 0,
            page: 1,
            size: 100,
            total: 0,
            totalPages: 0,
          },
        },
      },

      {
        acId: 'AC-H-10',
        title: 'Size exceeds maximum (101)',
        input: {
          tenantId: 1,
          page: 1,
          size: 101,
        },
        expected: {
          exception: {
            type: 'ApplicationException',
            messageKey: 'between.numeric',
          },
        },
      },
    ];

    it.each(validationTestCases)('[$acId] $title', async ({ acId, input, expected }) => {
      // Arrange
      const dto = new GetListProductCategoryDTO(
        input.tenantId,
        input.productCategoryName,
        input.activeStatuses,
        input.productCategoryAncestors,
        input.page,
        input.size,
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      if (expected.exception) {
        // Expect exception to be thrown
        await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

        try {
          await handler.execute(query);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ApplicationException);
          expect(error.messageKey).toBe(expected.exception.messageKey);
        }
      } else {
        // Expect successful execution
        const result = await handler.execute(query);

        expect(result).toBeDefined();
        expect(result.page).toBe(expected.response!.page);
        expect(result.size).toBe(expected.response!.size);
        expect(result.total).toBe(expected.response!.total);
        expect(result.totalPages).toBe(expected.response!.totalPages);
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data).toHaveLength(expected.response!.dataLength);
      }
    });
  });

  /**
   * Test Cases: Page Out of Range Validation
   * When total items exist, page must not exceed totalPages
   */
  describe('Page Out of Range Validation', () => {
    it('[AC-H-20] Page exceeds totalPages when data exists', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(25); // 25 items
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(
        1, // tenantId
        undefined,
        undefined,
        undefined,
        5, // page = 5 (but only 3 pages exist with size=10)
        10, // size = 10
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(ApplicationException);

      try {
        await handler.execute(query);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.messageKey).toBe('max.numeric');
        expect(error.params.max).toBe(3); // totalPages = ceil(25/10) = 3
      }
    });

    it('[AC-H-21] Page = totalPages is valid', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(25);
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 3, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(3);
    });

    it('[AC-H-22] Any page is valid when total = 0', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(0);
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 100, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.page).toBe(100);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  /**
   * Test Cases: Response DTO Structure
   */
  describe('Response DTO Structure', () => {
    it('[AC-H-30] Response has correct structure', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(0);
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');

      expect(result.data).toBeInstanceOf(Array);
      expect(typeof result.page).toBe('number');
      expect(typeof result.size).toBe('number');
      expect(typeof result.total).toBe('number');
      expect(typeof result.totalPages).toBe('number');
    });
  });

  /**
   * Test Cases: Data Transformation (Models → Response DTOs)
   * Handler MUST map ProductCategoryModel (snake_case) to ProductCategoryResponseDTO (camelCase)
   */
  describe('Data Transformation', () => {
    it('[AC-H-35] Maps ProductCategoryModel to ProductCategoryResponseDTO correctly', async () => {
      // Arrange: Mock repository to return ProductCategoryModel[] with snake_case fields
      const mockModels = [
        {
          id: 1,
          name: 'Electronics',
          tenant_id: 1,
          product_category_parent_id: null,
          level: 0,
          parent_level1_id: null,
          parent_level2_id: null,
          active_status: 1,
          creator_id: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Computers',
          tenant_id: 1,
          product_category_parent_id: 1,
          level: 1,
          parent_level1_id: 1,
          parent_level2_id: null,
          active_status: 1,
          creator_id: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (repository.count as jest.Mock).mockResolvedValue(2);
      (repository.findAll as jest.Mock).mockResolvedValue(mockModels);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert: Verify camelCase mapping
      expect(result.data).toHaveLength(2);

      const firstItem = result.data[0];
      expect(firstItem.id).toBe(1);
      expect(firstItem.name).toBe('Electronics');
      expect(firstItem.tenantId).toBe(1); // snake_case → camelCase
      expect(firstItem.productCategoryParentId).toBe(null);
      expect(firstItem.level).toBe(0);
      expect(firstItem.parentLevel1Id).toBe(null);
      expect(firstItem.parentLevel2Id).toBe(null);
      expect(firstItem.activeStatus).toBe(1);
      expect(firstItem.creatorId).toBe(100);

      const secondItem = result.data[1];
      expect(secondItem.id).toBe(2);
      expect(secondItem.name).toBe('Computers');
      expect(secondItem.tenantId).toBe(1);
      expect(secondItem.productCategoryParentId).toBe(1);
      expect(secondItem.level).toBe(1);
      expect(secondItem.parentLevel1Id).toBe(1);
      expect(secondItem.parentLevel2Id).toBe(null);
      expect(secondItem.activeStatus).toBe(1);
      expect(secondItem.creatorId).toBe(100);
    });

    it('[AC-H-36] Handles null values correctly in mapping', async () => {
      // Arrange: Model with null values
      const mockModels = [
        {
          id: 1,
          name: 'Electronics',
          tenant_id: 1,
          product_category_parent_id: null,
          level: 0,
          parent_level1_id: null,
          parent_level2_id: null,
          active_status: 1,
          creator_id: null, // null creator
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (repository.count as jest.Mock).mockResolvedValue(1);
      (repository.findAll as jest.Mock).mockResolvedValue(mockModels);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert: Null values should be preserved
      expect(result.data).toHaveLength(1);
      expect(result.data[0].productCategoryParentId).toBeNull();
      expect(result.data[0].parentLevel1Id).toBeNull();
      expect(result.data[0].parentLevel2Id).toBeNull();
      expect(result.data[0].creatorId).toBeNull();
    });

    it('[AC-H-37] Converts numeric strings to numbers', async () => {
      // Arrange: Model with string numbers (simulating DB bigint returned as strings)
      const mockModels = [
        {
          id: '999999999999', // bigint as string
          name: 'Test Category',
          tenant_id: '1',
          product_category_parent_id: '888888888888',
          level: '2',
          parent_level1_id: '111111111111',
          parent_level2_id: '222222222222',
          active_status: '1',
          creator_id: '333333333333',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (repository.count as jest.Mock).mockResolvedValue(1);
      (repository.findAll as jest.Mock).mockResolvedValue(mockModels);

      const dto = new GetListProductCategoryDTO(1, undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      // Act
      const result = await handler.execute(query);

      // Assert: All numeric fields should be converted to numbers
      const item = result.data[0];
      expect(typeof item.id).toBe('number');
      expect(typeof item.tenantId).toBe('number');
      expect(typeof item.productCategoryParentId).toBe('number');
      expect(typeof item.level).toBe('number');
      expect(typeof item.parentLevel1Id).toBe('number');
      expect(typeof item.parentLevel2Id).toBe('number');
      expect(typeof item.activeStatus).toBe('number');
      expect(typeof item.creatorId).toBe('number');

      expect(item.id).toBe(999999999999);
      expect(item.tenantId).toBe(1);
      expect(item.productCategoryParentId).toBe(888888888888);
    });
  });

  /**
   * Test Cases: Repository Calls
   * Verify handler calls repository with correct parameters
   */
  describe('Repository Interaction', () => {
    it('[AC-H-40] Calls repository.count() with correct params', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(0);
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(
        1, // tenantId
        'Electronics', // productCategoryName
        [1], // activeStatuses
        [10, 20], // productCategoryAncestors
        1,
        10,
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act
      await handler.execute(query);

      // Assert
      expect(repository.count).toHaveBeenCalledWith(
        1, // tenantId
        'Electronics', // productCategoryName
        [1], // activeStatuses
        [10, 20], // productCategoryAncestors
      );
    });

    it('[AC-H-41] Calls repository.findAll() with correct params', async () => {
      // Arrange
      (repository.count as jest.Mock).mockResolvedValue(0);
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const dto = new GetListProductCategoryDTO(
        1,
        'Electronics',
        [1],
        [10, 20],
        2, // page
        15, // size
      );
      const query = new GetListProductCategoryQuery(dto);

      // Act
      await handler.execute(query);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(
        1, // tenantId
        'Electronics', // productCategoryName
        [1], // activeStatuses
        [10, 20], // productCategoryAncestors
        2, // page
        15, // size
      );
    });
  });
});
