import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class ProductCategoryNotFoundException extends DomainException {
  constructor(categoryId: number, instance?: string) {
    super({
      messageKey: 'resource_not_found',
      params: {
        resourceType: 'nhóm hàng',
        resourceId: categoryId
      },
      instance,
    });
    this.name = 'ProductCategoryNotFoundException';
  }
}
