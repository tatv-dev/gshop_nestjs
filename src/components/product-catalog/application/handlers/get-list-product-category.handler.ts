// src/components/product-catalog/application/handlers/get-list-product-category.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetListProductCategoryQuery } from '../queries/get-list-product-category.query';
import { IProductCategoryQueryRepository } from '../repositories/product-category-query.repository';
import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';

export interface ProductCategoryResponseDTO {
  id: number;
  name: string;
  tenantId: number;
  productCategoryParentId: number | null;
  level: number;
  parentLevel1Id: number | null;
  parentLevel2Id: number | null;
  activeStatus: number;
  creatorId: number | null;
}

export interface GetListProductCategoryResponseDTO {
  data: ProductCategoryResponseDTO[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

@QueryHandler(GetListProductCategoryQuery)
export class GetListProductCategoryQueryHandler
  implements IQueryHandler<GetListProductCategoryQuery, GetListProductCategoryResponseDTO>
{
  constructor(
    @Inject('IProductCategoryQueryRepository')
    private readonly repository: IProductCategoryQueryRepository,
  ) {}

  async execute(query: GetListProductCategoryQuery): Promise<GetListProductCategoryResponseDTO> {
    const { dto } = query;

    // Validate pagination parameters
    const page = dto.page || 1;
    const size = dto.size || 10;

    // Validate page
    const MAX_PAGE = 1000;
    if (page > MAX_PAGE) {
      throw new ApplicationException({
        messageKey: 'max.numeric',
        params: {
          attribute: 'Số trang',
          max: MAX_PAGE
        },
      });
    }
    if (page < 1) {
      throw new ApplicationException({
        messageKey: 'min.numeric',
        params: {
          attribute: 'Số trang',
          min: 1
        },
      });
    }

    // Validate size
    const MIN_SIZE = 1;
    const MAX_SIZE = 100;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      throw new ApplicationException({
        messageKey: 'between.numeric',
        params: {
          attribute: 'Kích thước trang',
          min: MIN_SIZE,
          max: MAX_SIZE
        },
      });
    }

    // Get total count for pagination
    const total = await this.repository.count(
      dto.tenantId,
      dto.productCategoryName,
      dto.activeStatuses,
      dto.productCategoryAncestors,
    );

    // Calculate total pages
    const totalPages = Math.ceil(total / size);

    // Validate page is not beyond available pages (only if there are results)
    if (total > 0 && page > totalPages) {
      throw new ApplicationException({
        messageKey: 'max.numeric',
        params: {
          attribute: 'Số trang',
          max: totalPages
        },
      });
    }

    // Get paginated data (raw query results)
    const queryResults = await this.repository.findAll(
      dto.tenantId,
      dto.productCategoryName,
      dto.activeStatuses,
      dto.productCategoryAncestors,
      dto.page,
      dto.size,
    );

    // Map raw query results to response DTOs
    const data: ProductCategoryResponseDTO[] = queryResults.map((result) => ({
      id: result.id,
      name: result.name,
      tenantId: result.tenant_id,
      productCategoryParentId: result.product_category_parent_id,
      level: result.level,
      parentLevel1Id: result.parent_level1_id,
      parentLevel2Id: result.parent_level2_id,
      activeStatus: result.active_status,
      creatorId: result.creator_id,
    }));

    return {
      data,
        page,
        size,
        total,
        totalPages,
    };
  }
}
