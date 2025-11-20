// src/components/product-catalog/application/handlers/get-list-product-category.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetListProductCategoryQuery } from '../queries/get-list-product-category.query';
import { IProductCategoryQueryRepository } from '../repositories/product-category-query.repository';
import {
  PageOverLimitException,
  PageBelowMinException,
  SizeOutOfRangeException,
  PageOutOfRangeException,
} from '../exceptions/invalid-pagination.exception';

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
      throw new PageOverLimitException(page, MAX_PAGE);
    }
    if (page < 1) {
      throw new PageBelowMinException(page, 1);
    }

    // Validate size
    const MIN_SIZE = 1;
    const MAX_SIZE = 100;
    if (size < MIN_SIZE || size > MAX_SIZE) {
      throw new SizeOutOfRangeException(size, MIN_SIZE, MAX_SIZE);
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
      throw new PageOutOfRangeException(page, totalPages);
    }

    // Get paginated data
    const categories = await this.repository.findAll(
      dto.tenantId,
      dto.productCategoryName,
      dto.activeStatuses,
      dto.productCategoryAncestors,
      dto.page,
      dto.size,
    );

    // Map entities to response DTOs
    const data: ProductCategoryResponseDTO[] = categories.map((category) => ({
      id: category.id,
      name: category.getName(),
      tenantId: category.tenantId,
      productCategoryParentId: category.productCategoryParentId,
      level: category.level,
      parentLevel1Id: category.parentLevel1Id,
      parentLevel2Id: category.parentLevel2Id,
      activeStatus: category.activeStatus,
      creatorId: category.creatorId,
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
