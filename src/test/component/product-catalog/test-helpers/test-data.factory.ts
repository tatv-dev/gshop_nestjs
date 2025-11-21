export interface TestCase {
  acId: string;
  title: string;
  input: any;
  expected: any;
}

/**
 * Factory cung cấp dữ liệu test (Data Provider).
 * Chứa các test case từ Test Plan.
 */
export class TestDataFactory {
  static getValidationTestCases(): TestCase[] {
    return [
      // --- HAPPY PATH (ALWAYS FIRST) ---
      {
        acId: 'AC_OFAT_00',
        title: '[BASE]<Case cơ sở hợp lệ>',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], tenantId: 11, page: 1, size: 20 },
        expected: { valid: true }
      },
      // --- ERROR CASES (OFAT - productCategoryName) ---
      {
        acId: 'AC_OFAT_01',
        title: '[productCategoryName]Sai kiểu dữ liệu',
        input: { productCategoryName: 123, activeStatuses: [1], productCategoryAncestors: [1], tenantId: 11, page: 1, size: 20 },
        expected: { valid: false, errorCode: 'invalid_type', field: 'productCategoryName' }
      },
      {
        acId: 'AC_OFAT_02',
        title: '[productCategoryName]Null',
        input: { productCategoryName: null, activeStatuses: [1], productCategoryAncestors: [1], tenantId: 11, page: 1, size: 20 },
        expected: { valid: false, errorCode: 'null_not_allowed', field: 'productCategoryName' }
      },
      {
        acId: 'AC_OFAT_03',
        title: '[productCategoryName]Chuỗi rỗng/blank',
        input: { productCategoryName: '', activeStatuses: [1], productCategoryAncestors: [1], tenantId: 11, page: 1, size: 20 },
        expected: { valid: false, errorCode: 'empty_or_blank', field: 'productCategoryName' }
      },
      // --- OFAT CASES (tenantId) ---
       {
        acId: 'AC_OFAT_23',
        title: '[tenantId]Thiếu field (missing)',
        input: { productCategoryName: 'Điện thoại 123', activeStatuses: [1], productCategoryAncestors: [1], page: 1, size: 20 },
        expected: { valid: false, errorCode: 'missing', field: 'tenantId' }
      },
      // ... (Các case còn lại nên được thêm vào đây từ Test Plan để đầy đủ)
    ];
  }
}