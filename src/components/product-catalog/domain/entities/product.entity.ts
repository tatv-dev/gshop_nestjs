// src/components/product-catalog/domain/entities/product.entity.ts
import { ProductCodeVO } from '../value-objects/product-code.vo';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

/**
 * Product Domain Entity
 * Represents a product in the domain model
 */
export class Product {
  private constructor(
    public readonly id: number,
    public readonly productCode: ProductCodeVO,
    public readonly productName: string,
    public readonly description: string,
    public readonly price: number,
    public readonly unit: string,
    public readonly categoryId: number,
    public readonly categoryName: string,
    private readonly tenantId: number,
    public readonly activeStatus: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create Product with validation
   */
  static create(data: {
    id: number;
    productCode: ProductCodeVO;
    productName: string;
    description: string;
    price: number;
    unit: string;
    categoryId: number;
    categoryName: string;
    tenantId: number;
    activeStatus: number;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    // Validate product name
    if (!data.productName || data.productName.trim().length === 0) {
      throw new DomainError('Product name cannot be empty');
    }

    // Validate price
    if (data.price < 0) {
      throw new DomainError('Price must be greater than or equal to 0');
    }

    // Validate tenantId
    if (data.tenantId <= 0) {
      throw new DomainError('Tenant ID must be greater than 0');
    }

    return new Product(
      data.id,
      data.productCode,
      data.productName,
      data.description,
      data.price,
      data.unit,
      data.categoryId,
      data.categoryName,
      data.tenantId,
      data.activeStatus,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Check if product is active
   */
  isActive(): boolean {
    return this.activeStatus === 1;
  }

  /**
   * Convert to plain object for presentation
   */
  toObject(): {
    productId: number;
    productCode: string;
    productName: string;
    description: string;
    price: number;
    unit: string;
    categoryId: number;
    categoryName: string;
    activeStatus: number;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      productId: this.id,
      productCode: this.productCode.value,
      productName: this.productName,
      description: this.description,
      price: this.price,
      unit: this.unit,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      activeStatus: this.activeStatus,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
