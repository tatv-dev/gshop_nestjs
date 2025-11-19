// src/components/product-catalog/presentation/responses/find-product-by-code.response.ts
import { ApiProperty } from '@nestjs/swagger';

/**
 * Product Data Response
 */
export class ProductDataResponse {
  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'PROD-001' })
  productCode: string;

  @ApiProperty({ example: 'Test Product' })
  productName: string;

  @ApiProperty({ example: 'Product description' })
  description: string;

  @ApiProperty({ example: 100.5 })
  price: number;

  @ApiProperty({ example: 'pcs' })
  unit: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'Electronics' })
  categoryName: string;

  @ApiProperty({ example: 1 })
  activeStatus: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updatedAt: string;
}

/**
 * Find Product By Code Response DTO
 */
export class FindProductByCodeResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ProductDataResponse })
  data: ProductDataResponse;

  @ApiProperty({ example: '2025-01-19T00:00:00.000Z' })
  timestamp: string;
}
