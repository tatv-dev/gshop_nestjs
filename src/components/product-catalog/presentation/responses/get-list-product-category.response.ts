// src/components/product-catalog/presentation/responses/get-list-product-category.response.ts
import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO cho single product category
 */
export class ProductCategoryResponseDTO {
  @ApiProperty({
    description: 'Product category ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: 1,
  })
  tenantId: number;

  @ApiProperty({
    description: 'Parent category ID',
    example: null,
    nullable: true,
  })
  productCategoryParentId: number | null;

  @ApiProperty({
    description: 'Category level (0, 1, 2)',
    example: 0,
  })
  level: number;

  @ApiProperty({
    description: 'Parent level 1 ID',
    example: null,
    nullable: true,
  })
  parentLevel1Id: number | null;

  @ApiProperty({
    description: 'Parent level 2 ID',
    example: null,
    nullable: true,
  })
  parentLevel2Id: number | null;

  @ApiProperty({
    description: 'Active status (0: inactive, 1: active)',
    example: 1,
  })
  activeStatus: number;

  @ApiProperty({
    description: 'Creator ID',
    example: 1,
    nullable: true,
  })
  creatorId: number | null;
}

/**
 * Response DTO cho get list product categories với pagination
 */
export class GetListProductCategoryResponseDTO {
  @ApiProperty({
    description: 'List of product categories',
    type: [ProductCategoryResponseDTO],
  })
  data: ProductCategoryResponseDTO[];

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 10,
  })
  size: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  constructor(
    data: ProductCategoryResponseDTO[],
    page: number,
    size: number,
    total: number,
    totalPages: number,
  ) {
    this.data = data;
    this.page = page;
    this.size = size;
    this.total = total;
    this.totalPages = totalPages;
  }

  static create(
    data: ProductCategoryResponseDTO[],
    page: number,
    size: number,
    total: number,
    totalPages: number,
  ): GetListProductCategoryResponseDTO {
    return new GetListProductCategoryResponseDTO(data, page, size, total, totalPages);
  }
}
