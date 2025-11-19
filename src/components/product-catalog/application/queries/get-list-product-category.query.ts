// src/components/product-catalog/application/queries/get-list-product-category.query.ts
import { IQuery } from '@nestjs/cqrs';
import { GetListProductCategoryDTO } from '../dtos/get-list-product-category.dto';

export class GetListProductCategoryQuery implements IQuery {
  constructor(public readonly dto: GetListProductCategoryDTO) {}
}
