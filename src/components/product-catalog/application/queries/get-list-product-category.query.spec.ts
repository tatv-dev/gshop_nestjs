// src/components/product-catalog/application/queries/get-list-product-category.query.spec.ts
import { GetListProductCategoryQuery } from './get-list-product-category.query';
import { GetListProductCategoryDTO } from '../dtos/get-list-product-category.dto';

describe('GetListProductCategoryQuery', () => {
  it('should create query with DTO', () => {
    const dto = new GetListProductCategoryDTO(
      '100',
      'Electronics',
      [1],
      ['1'],
      1,
      10,
    );
    const query = new GetListProductCategoryQuery(dto);

    expect(query.dto).toBe(dto);
  });

  it('should encapsulate DTO data', () => {
    const dto = new GetListProductCategoryDTO('100');
    const query = new GetListProductCategoryQuery(dto);

    expect(query.dto.tenantId).toBe('100');
  });
});
