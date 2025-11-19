// src/components/product-catalog/presentation/controllers/product-catalog.controller.ts
import {
  Controller,
  Get,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FindProductByCodeRequest } from '../requests/find-product-by-code.request';
import { FindProductByCodeResponse } from '../responses/find-product-by-code.response';
import { FindProductByCodeQuery } from '../../application/queries/find-product-by-code.query';
import { ProductNotFoundError } from '../../domain/errors/product.error';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';

@ApiTags('Product Catalog')
@Controller('api/v2/product-catalog')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductCatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('find-product-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find product by code',
    description: 'Search for a product using its unique product code',
  })
  @ApiQuery({
    name: 'productCode',
    description: 'Product code to search',
    example: 'PROD-001',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Product found successfully',
    type: FindProductByCodeResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        error: 'Product with code "PROD-001" not found',
        code: 'PRODUCT_NOT_FOUND',
        timestamp: '2025-01-19T00:00:00.000Z',
        path: '/api/v2/product-catalog/find-product-code',
        method: 'GET',
      },
    },
  })
  async findByCode(
    @Query() request: FindProductByCodeRequest,
    @Req() httpRequest: any,
  ): Promise<FindProductByCodeResponse> {
    // Extract tenantId from JWT token
    const user = httpRequest.user;
    if (!user || !user.tenant_id) {
      throw new Error('User authentication data is missing');
    }

    const tenantId = user.tenant_id;

    try {
      // Create and execute query
      const query = new FindProductByCodeQuery(request.productCode, tenantId);
      const productData = await this.queryBus.execute(query);

      // Return success response
      return {
        success: true,
        data: productData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Handle ProductNotFoundError specifically
      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException({
          success: false,
          error: error.message,
          code: 'PRODUCT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      // Re-throw other errors
      throw error;
    }
  }
}
