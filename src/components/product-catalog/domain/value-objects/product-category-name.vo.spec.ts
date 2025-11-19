// src/components/product-catalog/domain/value-objects/product-category-name.vo.spec.ts
import { ProductCategoryNameVO } from './product-category-name.vo';

describe('ProductCategoryNameVO', () => {
  describe('Valid product category names', () => {
    it('should create with valid name', () => {
      const name = 'Electronics';
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });

    it('should create with name containing spaces', () => {
      const name = 'Home & Garden';
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });

    it('should create with name containing special characters', () => {
      const name = 'Food & Beverage - Premium';
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });

    it('should create with Vietnamese characters', () => {
      const name = 'Điện tử & Gia dụng';
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });

    it('should create with name at minimum length (1 char)', () => {
      const name = 'A';
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });

    it('should create with name at maximum length (255 chars)', () => {
      const name = 'A'.repeat(255);
      const vo = new ProductCategoryNameVO(name);
      expect(vo.getValue()).toBe(name);
    });
  });

  describe('Invalid product category names', () => {
    it('should throw error for empty string', () => {
      expect(() => new ProductCategoryNameVO('')).toThrow(
        'Product category name cannot be empty',
      );
    });

    it('should throw error for null', () => {
      expect(() => new ProductCategoryNameVO(null as any)).toThrow(
        'Product category name cannot be empty',
      );
    });

    it('should throw error for undefined', () => {
      expect(() => new ProductCategoryNameVO(undefined as any)).toThrow(
        'Product category name cannot be empty',
      );
    });

    it('should throw error for name exceeding max length (256 chars)', () => {
      const name = 'A'.repeat(256);
      expect(() => new ProductCategoryNameVO(name)).toThrow(
        'Product category name cannot exceed 255 characters',
      );
    });

    it('should throw error for whitespace only', () => {
      expect(() => new ProductCategoryNameVO('   ')).toThrow(
        'Product category name cannot be empty',
      );
    });
  });

  describe('Value object equality', () => {
    it('should be equal when names are the same', () => {
      const vo1 = new ProductCategoryNameVO('Electronics');
      const vo2 = new ProductCategoryNameVO('Electronics');
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should not be equal when names are different', () => {
      const vo1 = new ProductCategoryNameVO('Electronics');
      const vo2 = new ProductCategoryNameVO('Food');
      expect(vo1.equals(vo2)).toBe(false);
    });
  });
});
