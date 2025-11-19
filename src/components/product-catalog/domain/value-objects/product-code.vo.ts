// src/components/product-catalog/domain/value-objects/product-code.vo.ts
import { DomainError } from '../../../../shared/domain/errors/domain.error';

/**
 * Product Code Value Object
 * Encapsulates product code validation logic
 */
export class ProductCodeVO {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Factory method to create ProductCode with validation
   */
  static create(code: string): ProductCodeVO {
    // Trim whitespace
    const trimmedCode = code.trim();

    // Validate not empty
    if (trimmedCode.length === 0) {
      throw new DomainError('Product code cannot be empty');
    }

    // Validate length
    if (trimmedCode.length > 50) {
      throw new DomainError(
        'Product code must be between 1 and 50 characters',
      );
    }

    // Validate pattern: only letters, numbers, hyphens, and underscores
    const pattern = /^[a-zA-Z0-9_-]+$/;
    if (!pattern.test(trimmedCode)) {
      throw new DomainError(
        'Product code can only contain letters, numbers, hyphens, and underscores',
      );
    }

    return new ProductCodeVO(trimmedCode);
  }

  /**
   * Get the value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Compare two ProductCode VOs
   */
  equals(other: ProductCodeVO): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this._value;
  }
}
