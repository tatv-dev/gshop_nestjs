// src/components/product-catalog/presentation/requests/get-list-product-category.request.spec.ts
import { validate } from 'class-validator';
import { GetListProductCategoryRequest } from './get-list-product-category.request';

describe('GetListProductCategoryRequest Validation (OFAT)', () => {
  describe('productCategoryName validation', () => {
    it('should pass with valid productCategoryName', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = 'Electronics';

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors).toHaveLength(0);
    });

    it('should pass when productCategoryName is undefined (optional)', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = undefined;

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors).toHaveLength(0);
    });

    it('should fail when productCategoryName is empty string', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = '';

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryName exceeds 255 characters', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = 'A'.repeat(256);

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should pass when productCategoryName is at max length (255 chars)', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryName = 'A'.repeat(255);

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors).toHaveLength(0);
    });

    it('should fail when productCategoryName is not a string', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).productCategoryName = 123;

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryName is null', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).productCategoryName = null;

      const errors = await validate(request);
      const nameErrors = errors.filter((e) => e.property === 'productCategoryName');
      expect(nameErrors.length).toBeGreaterThan(0);
    });
  });

  describe('activeStatuses validation', () => {
    it('should pass with valid activeStatuses [0]', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [0];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass with valid activeStatuses [1]', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [1];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass with valid activeStatuses [0, 1]', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [0, 1];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass when activeStatuses is undefined (optional)', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = undefined;

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors).toHaveLength(0);
    });

    it('should fail when activeStatuses is empty array', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses contains invalid value 2', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [2];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses contains invalid value -1', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [-1];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses contains mixed valid and invalid values', async () => {
      const request = new GetListProductCategoryRequest();
      request.activeStatuses = [0, 1, 2];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses is not an array', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).activeStatuses = '0,1';

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses contains non-numeric values', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).activeStatuses = ['0', '1'];

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('should fail when activeStatuses is null', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).activeStatuses = null;

      const errors = await validate(request);
      const statusErrors = errors.filter((e) => e.property === 'activeStatuses');
      expect(statusErrors.length).toBeGreaterThan(0);
    });
  });

  describe('productCategoryAncestors validation', () => {
    it('should pass with valid productCategoryAncestors single ID', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = ['1'];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors).toHaveLength(0);
    });

    it('should pass with valid productCategoryAncestors multiple IDs', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = ['1', '2', '3'];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors).toHaveLength(0);
    });

    it('should pass when productCategoryAncestors is undefined (optional)', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = undefined;

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors).toHaveLength(0);
    });

    it('should fail when productCategoryAncestors is empty array', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = [];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors contains empty string', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = [''];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors contains non-numeric string', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = ['abc'];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors contains negative number', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = ['-1'];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors contains zero', async () => {
      const request = new GetListProductCategoryRequest();
      request.productCategoryAncestors = ['0'];

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors is not an array', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).productCategoryAncestors = '1,2,3';

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });

    it('should fail when productCategoryAncestors is null', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).productCategoryAncestors = null;

      const errors = await validate(request);
      const ancestorErrors = errors.filter((e) => e.property === 'productCategoryAncestors');
      expect(ancestorErrors.length).toBeGreaterThan(0);
    });
  });

  describe('page validation', () => {
    it('should pass with valid page at minimum (1)', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 1;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors).toHaveLength(0);
    });

    it('should pass with valid page at maximum (1000)', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 1000;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors).toHaveLength(0);
    });

    it('should pass with valid page in middle range', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 500;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors).toHaveLength(0);
    });

    it('should pass when page is undefined (optional)', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = undefined;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors).toHaveLength(0);
    });

    it('should fail when page is 0', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 0;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });

    it('should fail when page is negative', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = -1;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });

    it('should fail when page exceeds maximum (1001)', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 1001;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });

    it('should fail when page is decimal', async () => {
      const request = new GetListProductCategoryRequest();
      request.page = 1.5;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });

    it('should fail when page is not a number', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).page = '10';

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });

    it('should fail when page is null', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).page = null;

      const errors = await validate(request);
      const pageErrors = errors.filter((e) => e.property === 'page');
      expect(pageErrors.length).toBeGreaterThan(0);
    });
  });

  describe('size validation', () => {
    it('should pass with valid size at minimum (1)', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 1;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors).toHaveLength(0);
    });

    it('should pass with valid size at maximum (500)', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 500;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors).toHaveLength(0);
    });

    it('should pass with valid size in middle range', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 50;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors).toHaveLength(0);
    });

    it('should pass when size is undefined (optional)', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = undefined;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors).toHaveLength(0);
    });

    it('should fail when size is 0', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 0;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should fail when size is negative', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = -1;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should fail when size exceeds maximum (501)', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 501;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should fail when size is decimal', async () => {
      const request = new GetListProductCategoryRequest();
      request.size = 10.5;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should fail when size is not a number', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).size = '10';

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should fail when size is null', async () => {
      const request = new GetListProductCategoryRequest();
      (request as any).size = null;

      const errors = await validate(request);
      const sizeErrors = errors.filter((e) => e.property === 'size');
      expect(sizeErrors.length).toBeGreaterThan(0);
    });
  });
});
