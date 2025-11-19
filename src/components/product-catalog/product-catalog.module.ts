// src/components/product-catalog/product-catalog.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { ProductModel } from './infrastructure/entities/product.model';
import { ProductCategoryModel } from './infrastructure/entities/product-category.model';
import { ProductQueryRepository } from './infrastructure/repositories/product-query.repository';

// Application
import { FindProductByCodeHandler } from './application/handlers/find-product-by-code.handler';

// Presentation
import { ProductCatalogController } from './presentation/controllers/product-catalog.controller';

// Query Handlers
const QueryHandlers = [FindProductByCodeHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ProductModel, ProductCategoryModel]),
  ],
  controllers: [ProductCatalogController],
  providers: [
    ...QueryHandlers,
    {
      provide: 'ProductRepository',
      useClass: ProductQueryRepository,
    },
  ],
  exports: ['ProductRepository'],
})
export class ProductCatalogModule {}
