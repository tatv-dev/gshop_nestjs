// src/components/product-catalog/domain/value-objects/product-category-name.vo.ts
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ProductCategoryNameVO {
  private readonly value: string;

  constructor(name: string) {
    this.validate(name);
    this.value = name.trim();
  }

  private validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException({
        messageKey: 'product_category_name_empty',
      });
    }

    if (name.length > 255) {
      throw new DomainException({
        messageKey: 'product_category_name_too_long',
      });
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductCategoryNameVO): boolean {
    return this.value === other.value;
  }
}
