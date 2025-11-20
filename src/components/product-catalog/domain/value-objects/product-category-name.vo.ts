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
        messageKey: 'required',
        params: { attribute: 'tên nhóm hàng' },
      });
    }

    if (name.length > 255) {
      throw new DomainException({
        messageKey: 'max.string',
        params: { attribute: 'tên nhóm hàng', max: 255 },
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
