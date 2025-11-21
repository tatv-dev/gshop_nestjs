// src/components/product-catalog/application/queries/get-list-product-category.query.ts
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetListProductCategoryDTO } from '../dtos/get-list-product-category.dto';
import { IProductCategoryQueryRepository } from '../repositories/product-category-query.repository';
import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';
import {
  ProductCategoryResponseDTO,
  GetListProductCategoryResponseDTO,
} from '../../presentation/responses/get-list-product-category.response';

export class GetListProductCategoryQuery implements IQuery {
  constructor(public readonly dto: GetListProductCategoryDTO) {}
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

    // Get paginated data (TypeORM models)
    const models = await this.repository.findAll(
      dto.tenantId,
      dto.productCategoryName,
      dto.activeStatuses,
      dto.productCategoryAncestors,
      dto.page,
      dto.size,
    );

    // Map models to response DTOs (snake_case → camelCase)
    const data: ProductCategoryResponseDTO[] = models.map((model) => ({
      id: Number(model.id),
      name: model.name,
      tenantId: Number(model.tenant_id),
      productCategoryParentId: model.product_category_parent_id ? Number(model.product_category_parent_id) : null,
      level: Number(model.level),
      parentLevel1Id: model.parent_level1_id ? Number(model.parent_level1_id) : null,
      parentLevel2Id: model.parent_level2_id ? Number(model.parent_level2_id) : null,
      activeStatus: Number(model.active_status),
      creatorId: model.creator_id ? Number(model.creator_id) : null,
    }));

    return GetListProductCategoryResponseDTO.create(data, page, size, total, totalPages);
  }
}
