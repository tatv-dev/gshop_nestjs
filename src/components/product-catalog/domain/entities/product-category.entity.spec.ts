// src/components/product-catalog/domain/entities/product-category.entity.spec.ts
import { ProductCategory } from './product-category.entity';
import { ProductCategoryNameVO } from '../value-objects/product-category-name.vo';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

describe('ProductCategory Entity', () => {
  describe('Entity creation', () => {
    it('should create a root product category (level 1)', () => {
      const category = new ProductCategory(1,
        new ProductCategoryNameVO('Electronics'), 100,
        null, // no parent for root
        1,
        null,
        null,
        1, 5,
      );

      expect(category.id).toBe(1);
      expect(category.getName()).toBe('Electronics');
      expect(category.tenantId).toBe(100);
      expect(category.productCategoryParentId).toBeNull();
      expect(category.level).toBe(1);
      expect(category.parentLevel1Id).toBeNull();
      expect(category.parentLevel2Id).toBeNull();
      expect(category.activeStatus).toBe(1);
      expect(category.creatorId).toBe(5);
    });

    it('should create a level 2 product category with parent', () => {
      const category = new ProductCategory(2,
        new ProductCategoryNameVO('Smartphones'), 100,
        1, // parent ID
        2,
        1, // parentLevel1Id = root parent
        null,
        1, 5,
      );

      expect(category.productCategoryParentId).toBe(1);
      expect(category.level).toBe(2);
      expect(category.parentLevel1Id).toBe(1);
      expect(category.parentLevel2Id).toBeNull();
    });

    it('should create a level 3 product category with full ancestry', () => {
      const category = new ProductCategory(3,
        new ProductCategoryNameVO('iPhone'), 100,
        2, // parent ID
        3,
        1, // grandparent
        2, // parent
        1, 5,
      );

      expect(category.level).toBe(3);
      expect(category.parentLevel1Id).toBe(1);
      expect(category.parentLevel2Id).toBe(2);
    });
  });

  describe('Business rules validation', () => {
    it('should throw error for invalid tenant ID (zero)', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 0,
            null,
            1,
            null,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid tenant ID (negative)', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), -1,
            null,
            1,
            null,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid level (zero)', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 100,
            null,
            0,
            null,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid level (greater than 3)', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 100,
            null,
            4,
            null,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error when level 1 has a parent', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 100,
            99, // parent should be null for level 1
            1,
            null,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error when level 2 or 3 has no parent', () => {
      expect(
        () =>
          new ProductCategory(2,
            new ProductCategoryNameVO('Smartphones'), 100,
            null, // level 2 must have parent
            2, 1,
            null,
            1, 5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid active status', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 100,
            null,
            1,
            null,
            null,
            2, // only 0 or 1 allowed
            5,
          ),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid creator ID (zero)', () => {
      expect(
        () =>
          new ProductCategory(1,
            new ProductCategoryNameVO('Electronics'), 100,
            null,
            1,
            null,
            null,
            1, 0,
          ),
      ).toThrow(DomainException);
    });

    it('should allow null creator ID for migrated data', () => {
      const category = new ProductCategory(1,
        new ProductCategoryNameVO('Electronics'), 100,
        null,
        1,
        null,
        null,
        1,
        null, // null creatorId is allowed
      );

      expect(category.creatorId).toBeNull();
    });
  });

  describe('Entity methods', () => {
    it('should check if category is active', () => {
      const activeCategory = new ProductCategory(1,
        new ProductCategoryNameVO('Electronics'), 100,
        null,
        1,
        null,
        null,
        1, 5,
      );
      expect(activeCategory.isActive()).toBe(true);

      const inactiveCategory = new ProductCategory(2,
        new ProductCategoryNameVO('Obsolete'), 100,
        null,
        1,
        null,
        null,
        0, 5,
      );
      expect(inactiveCategory.isActive()).toBe(false);
    });

    it('should check if category is root (level 1)', () => {
      const rootCategory = new ProductCategory(1,
        new ProductCategoryNameVO('Electronics'), 100,
        null,
        1,
        null,
        null,
        1, 5,
      );
      expect(rootCategory.isRoot()).toBe(true);

      const childCategory = new ProductCategory(2,
        new ProductCategoryNameVO('Smartphones'), 100, 1,
        2, 1,
        null,
        1, 5,
      );
      expect(childCategory.isRoot()).toBe(false);
    });

    it('should get ancestry path', () => {
      const level3Category = new ProductCategory(3,
        new ProductCategoryNameVO('iPhone'), 100, 2,
        3, 1, 2,
        1, 5,
      );

      const ancestry = level3Category.getAncestryPath();
      expect(ancestry).toEqual([1, 2]);
    });

    it('should get empty ancestry for root category', () => {
      const rootCategory = new ProductCategory(1,
        new ProductCategoryNameVO('Electronics'), 100,
        null,
        1,
        null,
        null,
        1, 5,
      );

      const ancestry = rootCategory.getAncestryPath();
      expect(ancestry).toEqual([]);
    });
  });
});
