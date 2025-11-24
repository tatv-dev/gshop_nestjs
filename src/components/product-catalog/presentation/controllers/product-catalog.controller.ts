// src/components/product-catalog/presentation/controllers/product-catalog.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetListProductCategoryRequest } from '../requests/get-list-product-category.request';
import { GetListProductCategoryQuery } from '../../application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../application/dtos/get-list-product-category.dto';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from '../../../../shared/infrastructure/guards/permission.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';

@ApiTags('Product Catalog')
@Controller('api/v1/product-catalog')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductCatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('product-categories')
  @RequirePermissions('GET_LIST_PRODUCT_CATEGORY')
  @ApiOperation({ summary: 'Get list of product categories with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of product categories' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getList(
    @Query() request: GetListProductCategoryRequest,
    @CurrentUser() user: any,
  ) {
    // Get tenantId from JWT token (single workspace: user.tenantId, multi-workspace: user.workspaces[0].tenantId)
    let tenantId: number | undefined = Number(user.tenantId);

    if (!tenantId && user.workspaces?.length > 0) {
      tenantId = user.workspaces[0].tenantId;
    }

    if (!tenantId || !Number.isInteger(tenantId) || tenantId <= 0) {
      throw new ApplicationException({
        messageKey: 'missing_parameter',
        params: { parameter: 'Tenant ID' },
      });
    }

    const dto = new GetListProductCategoryDTO(
      tenantId,
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
