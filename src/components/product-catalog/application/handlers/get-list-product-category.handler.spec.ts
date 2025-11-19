// src/components/product-catalog/application/handlers/get-list-product-category.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GetListProductCategoryQueryHandler } from './get-list-product-category.handler';
import { GetListProductCategoryQuery } from '../queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../dtos/get-list-product-category.dto';
import { IProductCategoryQueryRepository } from '../repositories/product-category-query.repository';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { ProductCategoryNameVO } from '../../domain/value-objects/product-category-name.vo';

describe('GetListProductCategoryQueryHandler', () => {
  let handler: GetListProductCategoryQueryHandler;
  let mockRepository: jest.Mocked<IProductCategoryQueryRepository>;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListProductCategoryQueryHandler,
        {
          provide: 'IProductCategoryQueryRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetListProductCategoryQueryHandler>(
      GetListProductCategoryQueryHandler,
    );
  });

  describe('execute', () => {
    it('should return product categories with pagination metadata', async () => {
      const dto = new GetListProductCategoryDTO('100', undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      const mockCategories = [
        new ProductCategory(
          '1',
          new ProductCategoryNameVO('Electronics'),
          '100',
          null,
          1,
          null,
          null,
          1,
          '5',
        ),
        new ProductCategory(
          '2',
          new ProductCategoryNameVO('Food'),
          '100',
          null,
          1,
          null,
          null,
          1,
          '5',
        ),
      ];

      mockRepository.findAll.mockResolvedValue(mockCategories);
      mockRepository.count.mockResolvedValue(2);

      const result = await handler.execute(query);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Electronics');
      expect(result.data[1].name).toBe('Food');
      expect(result.pagination).toEqual({
        page: 1,
        size: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should apply search filter to repository', async () => {
      const dto = new GetListProductCategoryDTO('100', 'Elect');
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await handler.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        '100',
        'Elect',
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should apply active status filter to repository', async () => {
      const dto = new GetListProductCategoryDTO('100', undefined, [1]);
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await handler.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        '100',
        undefined,
        [1],
        undefined,
        undefined,
        undefined,
      );
    });

    it('should apply ancestor filter to repository', async () => {
      const dto = new GetListProductCategoryDTO('100', undefined, undefined, ['1', '2']);
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await handler.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        '100',
        undefined,
        undefined,
        ['1', '2'],
        undefined,
        undefined,
      );
    });

    it('should apply pagination to repository', async () => {
      const dto = new GetListProductCategoryDTO('100', undefined, undefined, undefined, 2, 25);
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await handler.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        '100',
        undefined,
        undefined,
        undefined,
        2,
        25,
      );
    });

    it('should calculate correct total pages', async () => {
      const dto = new GetListProductCategoryDTO('100', undefined, undefined, undefined, 1, 10);
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(25);

      const result = await handler.execute(query);

      expect(result.pagination.totalPages).toBe(3); // 25 / 10 = 3 pages
    });

    it('should return empty array when no categories found', async () => {
      const dto = new GetListProductCategoryDTO('100');
      const query = new GetListProductCategoryQuery(dto);

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await handler.execute(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should map entity fields to response DTO correctly', async () => {
      const dto = new GetListProductCategoryDTO('100');
      const query = new GetListProductCategoryQuery(dto);

      const mockCategory = new ProductCategory(
        '123',
        new ProductCategoryNameVO('Smartphones'),
        '100',
        '1',
        2,
        '1',
        null,
        1,
        '5',
      );

      mockRepository.findAll.mockResolvedValue([mockCategory]);
      mockRepository.count.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result.data[0]).toMatchObject({
        id: '123',
        name: 'Smartphones',
        tenantId: '100',
        productCategoryParentId: '1',
        level: 2,
        parentLevel1Id: '1',
        parentLevel2Id: null,
        activeStatus: 1,
        creatorId: '5',
      });
    });
  });
});
