// src/components/product-catalog/domain/value-objects/product-category-name.vo.ts
export class ProductCategoryNameVO {
  private readonly value: string;

  constructor(name: string) {
    this.validate(name);
    this.value = name.trim();
  }

  private validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product category name cannot be empty');
    }

    if (name.length > 255) {
      throw new Error('Product category name cannot exceed 255 characters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductCategoryNameVO): boolean {
    return this.value === other.value;
  }
}
