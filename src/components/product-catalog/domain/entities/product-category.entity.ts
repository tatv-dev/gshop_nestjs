// src/components/product-catalog/domain/entities/product-category.entity.ts
import { ProductCategoryNameVO } from '../value-objects/product-category-name.vo';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ProductCategory {
  constructor(
    public readonly id: number,
    private readonly name: ProductCategoryNameVO,
    public readonly tenantId: number,
    public readonly productCategoryParentId: number | null,
    public readonly level: number,
    public readonly parentLevel1Id: number | null,
    public readonly parentLevel2Id: number | null,
    public readonly activeStatus: number,
    public readonly creatorId: number | null,
  ) {
    this.validateBusinessRules();
  }

  private validateBusinessRules(): void {
    // Validate tenant ID
    if (!Number.isInteger(this.tenantId) || this.tenantId <= 0) {
      throw new DomainException({
        messageKey: 'invalid_tenant_id',
      });
    }

    // Validate level (1-3)
    if (this.level < 1 || this.level > 3) {
      throw new DomainException({
        messageKey: 'invalid_level',
      });
    }

    // Level 1 cannot have a parent
    if (this.level === 1 && this.productCategoryParentId !== null) {
      throw new DomainException({
        messageKey: 'level1_cannot_have_parent',
      });
    }

    // Level 2 and 3 must have a parent
    if ((this.level === 2 || this.level === 3) && this.productCategoryParentId === null) {
      throw new DomainException({
        messageKey: 'level23_must_have_parent',
      });
    }

    // Validate active status (0 or 1)
    if (this.activeStatus !== 0 && this.activeStatus !== 1) {
      throw new DomainException({
        messageKey: 'invalid_active_status',
      });
    }

    // Validate creator ID (if provided)
    if (this.creatorId !== null) {
      if (!Number.isInteger(this.creatorId) || this.creatorId <= 0) {
        throw new DomainException({
          messageKey: 'invalid_creator_id',
        });
      }
    }
  }

  getName(): string {
    return this.name.getValue();
  }

  isActive(): boolean {
    return this.activeStatus === 1;
  }

  isRoot(): boolean {
    return this.level === 1;
  }

  getAncestryPath(): number[] {
    const path: number[] = [];

    if (this.parentLevel1Id !== null) {
      path.push(this.parentLevel1Id);
    }

    if (this.parentLevel2Id !== null) {
      path.push(this.parentLevel2Id);
    }

    return path;
  }
}
