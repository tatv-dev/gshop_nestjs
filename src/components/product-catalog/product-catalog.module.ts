// src/components/product-catalog/product-catalog.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryModel } from './infrastructure/entities/product-category.model';
import { ProductCategoryQueryRepository } from './infrastructure/repositories/product-category-query.repository';
import { GetListProductCategoryQueryHandler } from './application/queries/get-list-product-category.query-handler';
import { ProductCategoryController } from './presentation/controllers/product-category.controller';

const QueryHandlers = [GetListProductCategoryQueryHandler];

const Repositories = [
  {
    provide: 'IProductCategoryQueryRepository',
    useClass: ProductCategoryQueryRepository,
  },
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ProductCategoryModel])],
  controllers: [ProductCategoryController],
  providers: [...QueryHandlers, ...Repositories],
  exports: [],
})
export class ProductCatalogModule {}
