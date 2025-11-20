import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';

export class PageOverLimitException extends ApplicationException {
  constructor(page: number, limit: number, instance?: string) {
    super({
      messageKey: 'max.numeric',
      params: {
        attribute: 'Số trang',
        max: limit
      },
      instance,
    });
    this.name = 'PageOverLimitException';
  }
}

export class PageBelowMinException extends ApplicationException {
  constructor(page: number, min: number, instance?: string) {
    super({
      messageKey: 'min.numeric',
      params: {
        attribute: 'Số trang',
        min
      },
      instance,
    });
    this.name = 'PageBelowMinException';
  }
}

export class SizeOutOfRangeException extends ApplicationException {
  constructor(size: number, min: number, max: number, instance?: string) {
    super({
      messageKey: 'between.numeric',
      params: {
        attribute: 'Kích thước trang',
        min,
        max
      },
      instance,
    });
    this.name = 'SizeOutOfRangeException';
  }
}

export class PageOutOfRangeException extends ApplicationException {
  constructor(page: number, totalPages: number, instance?: string) {
    super({
      messageKey: 'max.numeric',
      params: {
        attribute: 'Số trang',
        max: totalPages
      },
      instance,
    });
    this.name = 'PageOutOfRangeException';
  }
}
