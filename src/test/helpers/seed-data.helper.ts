import { QueryRunner } from 'typeorm';

/**
 * Seed data helper for GetListProductCategory tests
 * Dependency order (topological sort):
 * 1. tenants (root)
 * 2. users (root)
 * 3. workspaces (depends on: tenants, users)
 * 4. resellers (depends on: tenants)
 * 5. employees (depends on: workspaces, resellers) - branches FK disabled initially
 * 6. branches (depends on: tenants, employees)
 * 7. product_categories (depends on: tenants, employees, self-referential)
 */

export const TEST_TENANT_ID = 11;
export const TEST_OTHER_TENANT_ID = 99;

export async function seedProductCategoryTestData(queryRunner: QueryRunner): Promise<void> {
  // Clear existing data (reverse dependency order)
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM branches WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM employees WHERE workspace_id IN (SELECT id FROM workspaces WHERE tenant_id IN (?, ?))', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM resellers WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM workspaces WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM users WHERE id IN (1001, 1002)');
  await queryRunner.query('DELETE FROM tenants WHERE id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

  // 1. Seed tenants
  await queryRunner.query(`
    INSERT INTO tenants (id, name, status, created_at, updated_at)
    VALUES
      (?, 'Test Tenant', 1, NOW(), NOW()),
      (?, 'Other Tenant', 1, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);

  // 2. Seed users
  await queryRunner.query(`
    INSERT INTO users (id, user_name, password, created_at, updated_at)
    VALUES
      (1001, 'test_user_1', 'password_hash', NOW(), NOW()),
      (1002, 'test_user_2', 'password_hash', NOW(), NOW())
  `);

  // 3. Seed workspaces
  await queryRunner.query(`
    INSERT INTO workspaces (id, status, user_id, tenant_id, created_at, updated_at)
    VALUES
      (1001, 1, 1001, ?, NOW(), NOW()),
      (1002, 1, 1002, ?, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);

  // 4. Seed resellers (optional, some employees may not have reseller)
  await queryRunner.query(`
    INSERT INTO resellers (id, name, tenant_id, status, created_at, updated_at)
    VALUES (1001, 'Test Reseller', ?, 1, NOW(), NOW())
  `, [TEST_TENANT_ID]);

  // 5. Seed employees (without branch_id initially due to circular dependency)
  await queryRunner.query(`
    INSERT INTO employees (id, name, workspace_id, reseller_id, branch_id, status, created_at, updated_at)
    VALUES
      (1001, 'Nguyen Van A', 1001, 1001, NULL, 1, NOW(), NOW()),
      (1002, 'Tran Thi B', 1002, NULL, NULL, 1, NOW(), NOW())
  `);

  // 6. Seed branches
  await queryRunner.query(`
    INSERT INTO branches (id, name, tenant_id, primary_phone, status, creator_id, created_at, updated_at)
    VALUES (1001, 'Chi nhánh 1', ?, '0123456789', 1, 1001, NOW(), NOW())
  `, [TEST_TENANT_ID]);

  // 7. Seed product_categories (hierarchical structure)
  // Level 1 categories (roots)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (1, 'Điện thoại 123', ?, NULL, 1, NULL, NULL, 1, 1001, NOW(), NOW()),
      (2, 'Laptop', ?, NULL, 1, NULL, NULL, 1, 1001, NOW(), NOW()),
      (3, 'Phụ kiện', ?, NULL, 1, NULL, NULL, 0, 1001, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_TENANT_ID, TEST_TENANT_ID]);

  // Level 2 categories (children of level 1)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (4, 'Điện thoại 123 Samsung', ?, 1, 2, 1, NULL, 1, 1001, NOW(), NOW()),
      (5, 'Điện thoại 123 iPhone', ?, 1, 2, 1, NULL, 1, 1001, NOW(), NOW()),
      (6, 'Điện thoại 123 Xiaomi', ?, 1, 2, 1, NULL, 0, 1001, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_TENANT_ID, TEST_TENANT_ID]);

  // Level 3 categories (children of level 2)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES
      (7, 'Điện thoại 123 Samsung Galaxy S', ?, 4, 3, 1, 4, 1, 1001, NOW(), NOW()),
      (8, 'Điện thoại 123 Samsung Galaxy A', ?, 4, 3, 1, 4, 0, 1001, NOW(), NOW())
  `, [TEST_TENANT_ID, TEST_TENANT_ID]);

  // Category for other tenant (for scope testing)
  await queryRunner.query(`
    INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, parent_level1_id, parent_level2_id, active_status, creator_id, created_at, updated_at)
    VALUES (100, 'Other Tenant Category', ?, NULL, 1, NULL, NULL, 1, 1002, NOW(), NOW())
  `, [TEST_OTHER_TENANT_ID]);
}

export async function cleanupProductCategoryTestData(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM branches WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM employees WHERE id IN (1001, 1002)');
  await queryRunner.query('DELETE FROM resellers WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM workspaces WHERE tenant_id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('DELETE FROM users WHERE id IN (1001, 1002)');
  await queryRunner.query('DELETE FROM tenants WHERE id IN (?, ?)', [TEST_TENANT_ID, TEST_OTHER_TENANT_ID]);
  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
}

export function generateLargeArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i + 1);
}
