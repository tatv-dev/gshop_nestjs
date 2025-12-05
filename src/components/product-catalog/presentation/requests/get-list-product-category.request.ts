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
import { ArrayNoDuplicates, transformToIntArray, transformToInt, toArray } from '../../../../shared/application/validators/custom-validators';
import { BaseRequestDTO } from '../../../../shared/application/dtos/base-request.dto';

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