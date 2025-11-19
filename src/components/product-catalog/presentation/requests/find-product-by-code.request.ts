// src/components/product-catalog/presentation/requests/find-product-by-code.request.ts
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Find Product By Code Request DTO
 * Presentation layer - HTTP request validation
 */
export class FindProductByCodeRequest {
  @ApiProperty({
    description: 'Product code to search',
    example: 'PROD-001',
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Product code can only contain letters, numbers, hyphens, and underscores',
  })
  productCode: string;
}
