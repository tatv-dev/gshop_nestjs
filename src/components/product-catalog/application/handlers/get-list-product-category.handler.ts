// src/components/product-catalog/application/handlers/get-list-product-category.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetListProductCategoryQuery } from '../queries/get-list-product-category.query';
import { IProductCategoryQueryRepository } from '../repositories/product-category-query.repository';

export interface ProductCategoryResponseDTO {
  id: string;
  name: string;
  tenantId: string;
  productCategoryParentId: string | null;
  level: number;
  parentLevel1Id: string | null;
  parentLevel2Id: string | null;
  activeStatus: number;
  creatorId: string | null;
}

export interface GetListProductCategoryResponseDTO {
  data: ProductCategoryResponseDTO[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
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

    // Get total count for pagination
    const total = await this.repository.count(
      dto.tenantId,
      dto.productCategoryName,
      dto.activeStatuses,
      dto.productCategoryAncestors,
    );

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

    // Calculate pagination metadata
    const page = dto.page || 1;
    const size = dto.size || 10;
    const totalPages = Math.ceil(total / size);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages,
      },
    };
  }
}
