// src/components/product-catalog/domain/entities/product.entity.spec.ts
import { Product } from './product.entity';
import { ProductCodeVO } from '../value-objects/product-code.vo';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

describe('Product Entity', () => {
  describe('AC_DOMAIN_02_01: Valid Product creation', () => {
    it('[PASS] should create Product with valid data', () => {
      // Arrange
      const productData = {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const product = Product.create(productData);

      // Assert
      expect(product).toBeInstanceOf(Product);
      expect(product.id).toBe(1);
      expect(product.productCode.value).toBe('PROD-001');
      expect(product.productName).toBe('Test Product');
      expect(product.price).toBe(100.50);
      expect(product.isActive()).toBe(true);
    });
  });

  describe('AC_DOMAIN_02_02: Invalid Product - Missing required fields', () => {
    it('[FAIL] should throw DomainError when productName is empty', () => {
      const productData = {
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: '',
        description: 'Test',
        price: 100,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 1,
        activeStatus: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Product.create(productData)).toThrow(DomainError);
      expect(() => Product.create(productData)).toThrow(
        'Product name cannot be empty',
      );
    });

    it('[FAIL] should throw DomainError when price is negative', () => {
      const productData = {
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: 'Test Product',
        description: 'Test',
        price: -10,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 1,
        activeStatus: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Product.create(productData)).toThrow(DomainError);
      expect(() => Product.create(productData)).toThrow(
        'Price must be greater than or equal to 0',
      );
    });

    it('[FAIL] should throw DomainError when tenantId is invalid', () => {
      const productData = {
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: 'Test Product',
        description: 'Test',
        price: 100,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 0,
        activeStatus: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Product.create(productData)).toThrow(DomainError);
      expect(() => Product.create(productData)).toThrow(
        'Tenant ID must be greater than 0',
      );
    });
  });

  describe('AC_DOMAIN_02_03: Product business methods', () => {
    it('[PASS] should return true for isActive when activeStatus is 1', () => {
      const product = Product.create({
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

      expect(product.isActive()).toBe(true);
    });

    it('[PASS] should return false for isActive when activeStatus is 0', () => {
      const product = Product.create({
        id: 1,
        productCode: ProductCodeVO.create('PROD-001'),
        productName: 'Test Product',
        description: 'Test',
        price: 100,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        tenantId: 1,
        activeStatus: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(product.isActive()).toBe(false);
    });

    it('[PASS] should convert to plain object', () => {
      const now = new Date();
      const product = Product.create({
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
        createdAt: now,
        updatedAt: now,
      });

      const plainObject = product.toObject();

      expect(plainObject).toEqual({
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        unit: 'pcs',
        categoryId: 1,
        categoryName: 'Electronics',
        activeStatus: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });
  });
});
