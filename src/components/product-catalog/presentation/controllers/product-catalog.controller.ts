// src/components/product-catalog/presentation/controllers/product-catalog.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetListProductCategoryRequest } from '../requests/get-list-product-category.request';
import { GetListProductCategoryQuery } from '../../application/queries/get-list-product-category.query';
import { GetListProductCategoryDTO } from '../../application/dtos/get-list-product-category.dto';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';

@ApiTags('Product Catalog')
@Controller('api/v1/product-catalog')
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
    // Handle tenantId for both single and multiple workspace scenarios
    let tenantId: number;

    if (user.workspaces && Array.isArray(user.workspaces) && user.workspaces.length > 0) {
      const firstWorkspace = user.workspaces[0];
      if (firstWorkspace && firstWorkspace.tenantId !== undefined && firstWorkspace.tenantId !== null) {
        tenantId = Number(firstWorkspace.tenantId);
      } else {
        throw new ApplicationException({
          messageKey: 'bad_request',
        });
      }
    }
    else {
      throw new ApplicationException({
        messageKey: 'missing_parameter',
        params: { parameter: 'Tenant ID' },
      });
    }

    // Validate tenantId is a valid number
    if (!Number.isInteger(tenantId) || tenantId <= 0) {
      throw new ApplicationException({
        messageKey: 'integer',
        params: { attribute: 'Tenant ID' },
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
