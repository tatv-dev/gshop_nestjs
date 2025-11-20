import { ApplicationException } from '../../../../shared/application/exceptions/application.exception';

export class PageOverLimitException extends ApplicationException {
  constructor(page: number, limit: number, instance?: string) {
    super({
      messageKey: 'page_over_limit',
      params: { page, limit },
      instance,
    });
    this.name = 'PageOverLimitException';
  }
}

export class PageBelowMinException extends ApplicationException {
  constructor(page: number, min: number, instance?: string) {
    super({
      messageKey: 'page_min',
      params: { page, min },
      instance,
    });
    this.name = 'PageBelowMinException';
  }
}

export class SizeOutOfRangeException extends ApplicationException {
  constructor(size: number, min: number, max: number, instance?: string) {
    super({
      messageKey: 'size_between',
      params: { size, min, max },
      instance,
    });
    this.name = 'SizeOutOfRangeException';
  }
}

export class PageOutOfRangeException extends ApplicationException {
  constructor(page: number, totalPages: number, instance?: string) {
    super({
      messageKey: 'page_out_of_range',
      params: { page, totalPages },
      instance,
    });
    this.name = 'PageOutOfRangeException';
  }
}
