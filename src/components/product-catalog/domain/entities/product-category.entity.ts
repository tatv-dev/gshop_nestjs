// src/components/product-catalog/domain/entities/product-category.entity.ts
import { ProductCategoryNameVO } from '../value-objects/product-category-name.vo';

export class ProductCategory {
  constructor(
    public readonly id: string,
    private readonly name: ProductCategoryNameVO,
    public readonly tenantId: string,
    public readonly productCategoryParentId: string | null,
    public readonly level: number,
    public readonly parentLevel1Id: string | null,
    public readonly parentLevel2Id: string | null,
    public readonly activeStatus: number,
    public readonly creatorId: string,
  ) {
    this.validateBusinessRules();
  }

  private validateBusinessRules(): void {
    // Validate tenant ID
    const tenantIdNum = parseInt(this.tenantId);
    if (isNaN(tenantIdNum) || tenantIdNum <= 0) {
      throw new Error('Tenant ID must be a positive number');
    }

    // Validate level (1-3)
    if (this.level < 1 || this.level > 3) {
      throw new Error('Level must be between 1 and 3');
    }

    // Level 1 cannot have a parent
    if (this.level === 1 && this.productCategoryParentId !== null) {
      throw new Error('Level 1 category cannot have a parent');
    }

    // Level 2 and 3 must have a parent
    if ((this.level === 2 || this.level === 3) && this.productCategoryParentId === null) {
      throw new Error('Level 2 and 3 categories must have a parent');
    }

    // Validate active status (0 or 1)
    if (this.activeStatus !== 0 && this.activeStatus !== 1) {
      throw new Error('Active status must be 0 or 1');
    }

    // Validate creator ID
    const creatorIdNum = parseInt(this.creatorId);
    if (isNaN(creatorIdNum) || creatorIdNum <= 0) {
      throw new Error('Creator ID must be a positive number');
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

  getAncestryPath(): string[] {
    const path: string[] = [];

    if (this.parentLevel1Id !== null) {
      path.push(this.parentLevel1Id);
    }

    if (this.parentLevel2Id !== null) {
      path.push(this.parentLevel2Id);
    }

    return path;
  }
}
