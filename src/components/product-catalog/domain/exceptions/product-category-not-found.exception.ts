import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ProductCategoryNotFoundException extends DomainException {
  constructor(categoryId: number, instance?: string) {
    super({
      messageKey: 'product_category_not_found',
      params: { categoryId },
      instance,
    });
    this.name = 'ProductCategoryNotFoundException';
  }
}
