import { QueryRunner } from 'typeorm';

/**
 * Seed data helper for GetListProductCategory tests
 * Uses high IDs (100000+) to avoid conflicts with existing data
 */

export const TEST_TENANT_ID = 100011;
export const TEST_OTHER_TENANT_ID = 100099;
export const TEST_USER_ID = 100001;
export const TEST_USER_WITHOUT_PERMISSION_ID = 100002;
export const TEST_WORKSPACE_ID = 100001;
export const TEST_WORKSPACE_WITHOUT_PERMISSION_ID = 100002;
export const TEST_EMPLOYEE_ID = 100001;
export const TEST_EMPLOYEE_WITHOUT_PERMISSION_ID = 100002;
export const TEST_PERMISSION_ID = 100001;
export const TEST_ROLE_WITH_PERMISSION_ID = 100001;
export const TEST_ROLE_WITHOUT_PERMISSION_ID = 100002;

// Test user credentials - User WITH permission
export const TEST_USER_CREDENTIALS = {
  username: 'test_user_with_permission',
  password: 'Test@123456',
  softwareId: 1,
};

// Test user credentials - User WITHOUT permission
export const TEST_USER_WITHOUT_PERMISSION_CREDENTIALS = {
  username: 'test_user_without_permission',
  password: 'Test@123456',
  softwareId: 1,
};

export async function seedProductCategoryTestData(queryRunner: QueryRunner): Promise<void> {
  // Disable FK checks temporarily
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

  // Clear existing test data (using high IDs) - in REVERSE dependency order
  await queryRunner.query('DELETE FROM product_categories WHERE id >= 100000');
  await queryRunner.query('DELETE FROM branches WHERE id >= 100000');
  await queryRunner.query('DELETE FROM role_workspaces WHERE workspace_id >= 100000');
  await queryRunner.query('DELETE FROM role_permissions WHERE role_id >= 100000');
  await queryRunner.query('DELETE FROM roles WHERE id >= 100000');
  await queryRunner.query('DELETE FROM permissions WHERE id >= 100000');
  await queryRunner.query('DELETE FROM employees WHERE id >= 100000');
  await queryRunner.query('DELETE FROM resellers WHERE id >= 100000');
  await queryRunner.query('DELETE FROM workspaces WHERE id >= 100000');
  await queryRunner.query('DELETE FROM users WHERE id >= 100000');
  await queryRunner.query('DELETE FROM tenants WHERE id >= 100000');

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

  // 0. Seed software (required for refresh_tokens FK)
  await queryRunner.query(`
    INSERT IGNORE INTO softwares (id, name, created_at, updated_at)
    VALUES (1, 'Test Software', NOW(), NOW())
  `);

  // 1. Seed tenants
  await queryRunner.query(`
    INSERT INTO tenants (id, name, status, created_at, updated_at)
    VALUES
      (?, 'Test Tenant E2E', 1, NOW(), NOW()),
      (?, 'Other Tenant E2E', 1, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);

  // 2. Seed users (bcrypt hash for 'Test@123456')
  const passwordHash = '$2b$10$XDbn1ClPLLwR3.Os1H3NP.2xfiTELB/rz.I3oozUHYGpE37Z2WN.y';
  await queryRunner.query(`
    INSERT INTO users (id, user_name, password, created_at, updated_at)
    VALUES
      (?, ?, ?, NOW(), NOW()),
      (?, ?, ?, NOW(), NOW())
  `, [
    TEST_USER_ID,
    TEST_USER_CREDENTIALS.username,
    passwordHash,
    TEST_USER_WITHOUT_PERMISSION_ID,
    TEST_USER_WITHOUT_PERMISSION_CREDENTIALS.username,
    passwordHash
  ]);

  // 3. Seed workspaces
  await queryRunner.query(`
    INSERT INTO workspaces (id, status, user_id, tenant_id, created_at, updated_at)
    VALUES
      (?, 1, ?, ?, NOW(), NOW()),
      (?, 1, ?, ?, NOW(), NOW())
  `, [
    TEST_WORKSPACE_ID,
    TEST_USER_ID,
    TEST_TENANT_ID,
    TEST_WORKSPACE_WITHOUT_PERMISSION_ID,
    TEST_USER_WITHOUT_PERMISSION_ID,
    TEST_TENANT_ID
  ]);

  // 4. Seed resellers
  await queryRunner.query(`
    INSERT INTO resellers (id, name, tenant_id, status, created_at, updated_at)
    VALUES (100001, 'Test Reseller E2E', ?, 1, NOW(), NOW())
  `, [TEST_TENANT_ID]);

  // 5. Seed employees
  await queryRunner.query(`
    INSERT INTO employees (id, name, workspace_id, reseller_id, branch_id, status, created_at, updated_at)
    VALUES
      (?, 'Employee With Permission', ?, 100001, NULL, 1, NOW(), NOW()),
      (?, 'Employee Without Permission', ?, NULL, NULL, 1, NOW(), NOW())
  `, [
    TEST_EMPLOYEE_ID,
    TEST_WORKSPACE_ID,
    TEST_EMPLOYEE_WITHOUT_PERMISSION_ID,
    TEST_WORKSPACE_WITHOUT_PERMISSION_ID
  ]);

  // 6. Seed permissions
  await queryRunner.query(`
    INSERT INTO permissions (id, name, software_id, permission_parent_id, status, created_at, updated_at)
    VALUES (?, 'GET_LIST_PRODUCT_CATEGORY', 1, NULL, 1, NOW(), NOW())
  `, [TEST_PERMISSION_ID]);

  // 7. Seed roles
  await queryRunner.query(`
    INSERT INTO roles (id, name, tenant_id, status, creator_id, created_at, updated_at)
    VALUES
      (?, 'Admin E2E', ?, 1, ?, NOW(), NOW()),
      (?, 'Staff E2E', ?, 1, ?, NOW(), NOW())
  `, [
    TEST_ROLE_WITH_PERMISSION_ID,
    TEST_TENANT_ID,
    TEST_EMPLOYEE_ID,
    TEST_ROLE_WITHOUT_PERMISSION_ID,
    TEST_TENANT_ID,
    TEST_EMPLOYEE_ID
  ]);

  // 8. Seed role_permissions (only Admin has the permission)
  await queryRunner.query(`
    INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
    VALUES (?, ?, NOW(), NOW())
  `, [TEST_ROLE_WITH_PERMISSION_ID, TEST_PERMISSION_ID]);

  // 9. Seed role_workspaces (assign roles to workspaces)
  await queryRunner.query(`
    INSERT INTO role_workspaces (role_id, workspace_id, created_at, updated_at)
    VALUES
      (?, ?, NOW(), NOW()),
      (?, ?, NOW(), NOW())
  `, [
    TEST_ROLE_WITH_PERMISSION_ID,
    TEST_WORKSPACE_ID,
    TEST_ROLE_WITHOUT_PERMISSION_ID,
    TEST_WORKSPACE_WITHOUT_PERMISSION_ID
  ]);

  // 10. Seed branches
  await queryRunner.query(`
    INSERT INTO branches (id, name, tenant_id, primary_phone, status, creator_id, created_at, updated_at)
    VALUES (100001, 'Chi nhánh Test', ?, '0123456789', 1, ?, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_EMPLOYEE_ID]);

  // 7. Seed product_categories (hierarchical structure)
  // Level 1 categories (roots)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (100001, 'Điện thoại 123', ?, NULL, 1, NULL, NULL, 1, ?, NOW(), NOW()),
      (100002, 'Laptop E2E', ?, NULL, 1, NULL, NULL, 1, ?, NOW(), NOW()),
      (100003, 'Phụ kiện E2E', ?, NULL, 1, NULL, NULL, 0, ?, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_EMPLOYEE_ID, TEST_TENANT_ID, TEST_EMPLOYEE_ID, TEST_TENANT_ID, TEST_EMPLOYEE_ID]);

  // Level 2 categories
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (100004, 'Điện thoại 123 Samsung', ?, 100001, 2, 100001, NULL, 1, ?, NOW(), NOW()),
      (100005, 'Điện thoại 123 iPhone', ?, 100001, 2, 100001, NULL, 1, ?, NOW(), NOW()),
      (100006, 'Điện thoại 123 Xiaomi', ?, 100001, 2, 100001, NULL, 0, ?, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_EMPLOYEE_ID, TEST_TENANT_ID, TEST_EMPLOYEE_ID, TEST_TENANT_ID, TEST_EMPLOYEE_ID]);

  // Level 3 categories
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (100007, 'Điện thoại 123 Samsung Galaxy S', ?, 100004, 3, 100001, 100004, 1, ?, NOW(), NOW()),
      (100008, 'Điện thoại 123 Samsung Galaxy A', ?, 100004, 3, 100001, 100004, 0, ?, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_EMPLOYEE_ID, TEST_TENANT_ID, TEST_EMPLOYEE_ID]);

  // Category for other tenant (scope testing)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES (100100, 'Other Tenant Category', ?, NULL, 1, NULL, NULL, 1, 100002, NOW(), NOW())
  `, [TEST_OTHER_TENANT_ID]);
}

export async function cleanupProductCategoryTestData(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('DELETE FROM product_categories WHERE id >= 100000');
  await queryRunner.query('DELETE FROM branches WHERE id >= 100000');
  await queryRunner.query('DELETE FROM role_workspaces WHERE workspace_id >= 100000');
  await queryRunner.query('DELETE FROM role_permissions WHERE role_id >= 100000');
  await queryRunner.query('DELETE FROM roles WHERE id >= 100000');
  await queryRunner.query('DELETE FROM permissions WHERE id >= 100000');
  await queryRunner.query('DELETE FROM employees WHERE id >= 100000');
  await queryRunner.query('DELETE FROM resellers WHERE id >= 100000');
  await queryRunner.query('DELETE FROM workspaces WHERE id >= 100000');
  await queryRunner.query('DELETE FROM users WHERE id >= 100000');
  await queryRunner.query('DELETE FROM tenants WHERE id >= 100000');
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
}

export function generateLargeArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i + 100000);
}
