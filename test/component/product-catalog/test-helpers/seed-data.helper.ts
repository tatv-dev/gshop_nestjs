// test/component/product-catalog/test-helpers/seed-data.helper.ts
import { QueryRunner } from 'typeorm';

/**
 * Seed Data Strategy for Product Catalog Tests
 *
 * Dependency Graph:
 * ```
 * tenants (root)
 *    ↓
 * product_categories (self-referencing)
 *    ↓ parent_id
 * product_categories (children)
 * ```
 *
 * Insert Order (Topological Sort):
 * 1. tenants (parent table)
 * 2. product_categories level 1 (no parent)
 * 3. product_categories level 2 (parent = level 1)
 * 4. product_categories level 3 (parent = level 2)
 */

/**
 * Seed minimal test data for get-list-product-category tests
 *
 * This seeds:
 * - 2 tenants
 * - 5 product categories for tenant 1 (hierarchy: 2 level1, 2 level2, 1 level3)
 * - 1 product category for tenant 2
 */
export async function seedGetListProductCategoryTestData(queryRunner: QueryRunner): Promise<void> {
  // Step 1: Clear existing data (reverse dependency order)
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id IN (1, 2)');
  // Note: We don't delete tenants as they might be used by other tests
  // If you need full isolation, uncomment:
  // await queryRunner.query('DELETE FROM tenants WHERE id IN (1, 2)');

  // Step 2: Seed tenants (parent table)
  // Using INSERT IGNORE to handle case where tenants already exist
  await queryRunner.query(`
    INSERT IGNORE INTO tenants (id, name, active_status, created_at, updated_at)
    VALUES
      (1, 'ICAR Test Tenant', 1, NOW(), NOW()),
      (2, 'Second Test Tenant', 1, NOW(), NOW())
  `);

  // Step 3: Seed product_categories (Level 1 - no parent)
  await queryRunner.query(`
    INSERT INTO product_categories (
      id, name, tenant_id, product_category_parent_id,
      level, parent_level1_id, parent_level2_id,
      active_status, creator_id, created_at, updated_at
    )
    VALUES
      -- Tenant 1: Level 1 categories
      (1, 'Electronics', 1, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),
      (2, 'Food & Beverage', 1, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),

      -- Tenant 2: Level 1 category
      (10, 'Books', 2, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW())
  `);

  // Step 4: Seed product_categories (Level 2 - children of level 1)
  await queryRunner.query(`
    INSERT INTO product_categories (
      id, name, tenant_id, product_category_parent_id,
      level, parent_level1_id, parent_level2_id,
      active_status, creator_id, created_at, updated_at
    )
    VALUES
      -- Tenant 1: Level 2 categories
      (3, 'Computers', 1, 1, 2, 1, NULL, 1, 1, NOW(), NOW()),
      (4, 'Mobile Phones', 1, 1, 2, 1, NULL, 1, 1, NOW(), NOW())
  `);

  // Step 5: Seed product_categories (Level 3 - children of level 2)
  await queryRunner.query(`
    INSERT INTO product_categories (
      id, name, tenant_id, product_category_parent_id,
      level, parent_level1_id, parent_level2_id,
      active_status, creator_id, created_at, updated_at
    )
    VALUES
      -- Tenant 1: Level 3 category
      (5, 'Laptops', 1, 3, 3, 1, 3, 1, 1, NOW(), NOW())
  `);
}

/**
 * Seed data for specific test cases
 */
export async function seedEmptyTenantData(queryRunner: QueryRunner, tenantId: number): Promise<void> {
  // Clear any existing categories for this tenant
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id = ?', [tenantId]);

  // Ensure tenant exists
  await queryRunner.query(`
    INSERT IGNORE INTO tenants (id, name, active_status, created_at, updated_at)
    VALUES (?, ?, 1, NOW(), NOW())
  `, [tenantId, `Test Tenant ${tenantId}`]);
}

/**
 * Seed data for pagination tests (large dataset)
 * Creates 150 categories for testing pagination boundaries
 */
export async function seedPaginationTestData(queryRunner: QueryRunner, tenantId: number): Promise<void> {
  // Clear existing data
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id = ?', [tenantId]);

  // Ensure tenant exists
  await queryRunner.query(`
    INSERT IGNORE INTO tenants (id, name, active_status, created_at, updated_at)
    VALUES (?, ?, 1, NOW(), NOW())
  `, [tenantId, `Pagination Test Tenant`]);

  // Generate 150 level 1 categories
  const categories = [];
  for (let i = 1; i <= 150; i++) {
    categories.push(`(${1000 + i}, 'Category ${i}', ${tenantId}, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW())`);
  }

  // Insert in batches of 50 to avoid query size limits
  const batchSize = 50;
  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);
    await queryRunner.query(`
      INSERT INTO product_categories (
        id, name, tenant_id, product_category_parent_id,
        level, parent_level1_id, parent_level2_id,
        active_status, creator_id, created_at, updated_at
      )
      VALUES ${batch.join(', ')}
    `);
  }
}

/**
 * Seed data for search/filter tests
 */
export async function seedSearchFilterTestData(queryRunner: QueryRunner, tenantId: number): Promise<void> {
  await queryRunner.query('DELETE FROM product_categories WHERE tenant_id = ?', [tenantId]);

  await queryRunner.query(`
    INSERT IGNORE INTO tenants (id, name, active_status, created_at, updated_at)
    VALUES (?, ?, 1, NOW(), NOW())
  `, [tenantId, `Search Test Tenant`]);

  // Seed categories with specific names for search testing
  await queryRunner.query(`
    INSERT INTO product_categories (
      id, name, tenant_id, product_category_parent_id,
      level, parent_level1_id, parent_level2_id,
      active_status, creator_id, created_at, updated_at
    )
    VALUES
      (2001, 'Áo sơ mi nam', ${tenantId}, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),
      (2002, 'Áo thun nữ', ${tenantId}, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),
      (2003, 'Quần jean nam', ${tenantId}, NULL, 1, NULL, NULL, 0, 1, NOW(), NOW()),
      (2004, 'Giày thể thao', ${tenantId}, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW())
  `);
}

/**
 * Cleanup test data
 * Call this in afterEach if NOT using transaction rollback
 */
export async function cleanupTestData(queryRunner: QueryRunner, tenantId?: number): Promise<void> {
  if (tenantId) {
    // Clean specific tenant data
    await queryRunner.query('DELETE FROM product_categories WHERE tenant_id = ?', [tenantId]);
  } else {
    // Clean all test data
    await queryRunner.query('DELETE FROM product_categories WHERE tenant_id IN (1, 2)');
  }
}
