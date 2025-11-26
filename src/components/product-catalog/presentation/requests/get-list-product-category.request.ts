// src/components/product-catalog/presentation/requests/get-list-product-category.request.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  Max,
  IsIn,
  IsNotEmpty,
  IsNotIn,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ArrayNoDuplicates } from '../../../../shared/application/validators/custom-validators';
import { BaseRequestDTO } from '../../../../shared/application/dtos/base-request.dto';

// Helper to transform query string arrays (e.g., "[1,0]" or "1,0" -> [1, 0])
// Preserves invalid values for proper validation error reporting
const transformToIntArray = ({ value }) => {
  // If already array, keep as-is to preserve original values for validation
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    // Handle "[1,0]" format
    const cleaned = value.replace(/^\[|\]$/g, '');
    if (!cleaned) return [];

    const parts = cleaned.split(',');
    const transformed = parts.map((v) => {
      const trimmed = v.trim();
      const num = parseInt(trimmed, 10);
      // Preserve original value if parsing fails
      return isNaN(num) ? trimmed : num;
    });

    // If any element failed to parse, return original string
    // This allows validator to report "wrong_type_array" instead of array element errors
    if (transformed.some(v => typeof v === 'string')) {
      return value;
    }

    return transformed;
  }

  return value;
};

// Helper to transform to integer (preserves invalid values for validation)
const transformToInt = ({ value }) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    // If parse fails, keep original to let validator catch it
    return isNaN(num) ? value : num;
  }
  return value;
};

export class GetListProductCategoryRequest extends BaseRequestDTO {
  @ApiProperty({
    description: 'Search by product category name',
    required: false,
    example: 'Electronics',
  })
  @ValidateIf((o) => o.productCategoryName !== undefined)
  @IsNotIn([null])
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  productCategoryName?: string;

  @ApiProperty({
    description: 'Filter by active statuses (0 = inactive, 1 = active)',
    required: false,
    example: [1],
    type: [Number],
  })
  @ValidateIf((o) => o.activeStatuses !== undefined)
  @IsNotIn([null])
  @Transform(transformToIntArray)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayNoDuplicates()
  @IsInt({ each: true })
  @IsIn([0, 1], { each: true })
  activeStatuses?: number[];

  @ApiProperty({
    description: 'Filter by ancestor category IDs (for tree filtering)',
    required: false,
    example: [1, 2],
    type: [Number],
  })
  @ValidateIf((o) => o.productCategoryAncestors !== undefined)
  @IsNotIn([null])
  @Transform(transformToIntArray)
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  productCategoryAncestors?: number[];

  @ApiProperty({
    description: 'Page number (1-1000)',
    required: false,
    example: 1,
  })
  @ValidateIf((o) => o.page !== undefined)
  @IsNotIn([null])
  @Transform(transformToInt)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number;

  @ApiProperty({
    description: 'Page size (1-500)',
    required: false,
    example: 10,
  })
  @ValidateIf((o) => o.size !== undefined)
  @IsNotIn([null])
  @Transform(transformToInt)
  @IsInt()
  @Min(1)
  @Max(500)
  size?: number;
}