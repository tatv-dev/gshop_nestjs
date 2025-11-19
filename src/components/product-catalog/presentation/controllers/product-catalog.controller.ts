// src/components/product-catalog/presentation/controllers/product-catalog.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetListProductCategoryRequest } from '../requests/get-list-product-category.request';
import { GetListProductCategoryQuery } from '../../application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../application/dtos/get-list-product-category.dto';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';

@ApiTags('Product Catalog')
@Controller('api/product-catalog')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductCatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('product-categories')
  @ApiOperation({ summary: 'Get list of product categories with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of product categories' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getList(
    @Query() request: GetListProductCategoryRequest,
    @CurrentUser() user: any,
  ) {
    const dto = new GetListProductCategoryDTO(
      user.tenantId.toString(),
      request.productCategoryName,
      request.activeStatuses,
      request.productCategoryAncestors,
      request.page,
      request.size,
    );

    const query = new GetListProductCategoryQuery(dto);
    return await this.queryBus.execute(query);
  }
}
