// src/components/product-catalog/application/dtos/get-list-product-category.dto.spec.ts
import { GetListProductCategoryDTO } from './get-list-product-category.dto';

describe('GetListProductCategoryDTO', () => {
  describe('DTO creation with valid data', () => {
    it('should create DTO with all fields', () => {
      const dto = new GetListProductCategoryDTO(
        '100',
        'Electronics',
        [0, 1],
        ['1', '2'],
        1,
        10,
      );

      expect(dto.tenantId).toBe('100');
      expect(dto.productCategoryName).toBe('Electronics');
      expect(dto.activeStatuses).toEqual([0, 1]);
      expect(dto.productCategoryAncestors).toEqual(['1', '2']);
      expect(dto.page).toBe(1);
      expect(dto.size).toBe(10);
    });

    it('should create DTO with only required fields (tenantId)', () => {
      const dto = new GetListProductCategoryDTO('100');

      expect(dto.tenantId).toBe('100');
      expect(dto.productCategoryName).toBeUndefined();
      expect(dto.activeStatuses).toBeUndefined();
      expect(dto.productCategoryAncestors).toBeUndefined();
      expect(dto.page).toBeUndefined();
      expect(dto.size).toBeUndefined();
    });

    it('should create DTO with search filter only', () => {
      const dto = new GetListProductCategoryDTO('100', 'Food');

      expect(dto.tenantId).toBe('100');
      expect(dto.productCategoryName).toBe('Food');
    });

    it('should create DTO with active status filter', () => {
      const dto = new GetListProductCategoryDTO('100', undefined, [1]);

      expect(dto.activeStatuses).toEqual([1]);
    });

    it('should create DTO with ancestor filter', () => {
      const dto = new GetListProductCategoryDTO(
        '100',
        undefined,
        undefined,
        ['5'],
      );

      expect(dto.productCategoryAncestors).toEqual(['5']);
    });

    it('should create DTO with pagination', () => {
      const dto = new GetListProductCategoryDTO(
        '100',
        undefined,
        undefined,
        undefined,
        2,
        25,
      );

      expect(dto.page).toBe(2);
      expect(dto.size).toBe(25);
    });
  });

  describe('DTO field types', () => {
    it('should have correct types for all fields', () => {
      const dto = new GetListProductCategoryDTO(
        '100',
        'Test',
        [0, 1],
        ['1', '2'],
        1,
        10,
      );

      expect(typeof dto.tenantId).toBe('string');
      expect(typeof dto.productCategoryName).toBe('string');
      expect(Array.isArray(dto.activeStatuses)).toBe(true);
      expect(Array.isArray(dto.productCategoryAncestors)).toBe(true);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.size).toBe('number');
    });
  });
});
