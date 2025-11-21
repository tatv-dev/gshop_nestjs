import { QueryRunner } from 'typeorm';

/**
 * Helper để seed dữ liệu cho Integration Tests.
 * Tuân thủ Dependency Graph: Tenants -> Users -> Workspaces -> Employees -> ProductCategories
 * Sử dụng Raw SQL để độc lập với Entity Model (tránh vòng lặp phụ thuộc khi dev).
 */
export class SeedDataHelper {
  static async seedProductCategories(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed Tenants (Root Table)
    await queryRunner.query(`
      INSERT INTO tenants (id, name, status, remaining_account_quota, total_account_quota, created_at, updated_at)
      VALUES (11, 'Test Tenant', 1, 10, 10, NOW(), NOW());
    `);

    // 2. Seed Users (cho Workspace)
    await queryRunner.query(`
      INSERT INTO users (id, user_name, password, created_at, updated_at)
      VALUES (101, 'admin_user', 'hashed_pass', NOW(), NOW());
    `);

    // 3. Seed Workspaces (Liên kết User-Tenant)
    await queryRunner.query(`
      INSERT INTO workspaces (id, status, user_id, tenant_id, created_at, updated_at)
      VALUES (201, 1, 101, 11, NOW(), NOW());
    `);

    // 4. Seed Employees (Cần cho creator_id)
    await queryRunner.query(`
      INSERT INTO employees (id, name, workspace_id, status, type, created_at, updated_at)
      VALUES (301, 'Test Creator', 201, 1, 1, NOW(), NOW());
    `);

    // 5. Seed Product Categories (Level 1 - Root Categories)
    await queryRunner.query(`
      INSERT INTO product_categories (id, name, tenant_id, level, active_status, creator_id, created_at, updated_at)
      VALUES 
      (1, 'Điện thoại', 11, 1, 1, 301, '2023-01-01 10:00:00', NOW()),
      (2, 'Laptop', 11, 1, 1, 301, '2023-01-02 10:00:00', NOW()),
      (3, 'Phụ kiện (Inactive)', 11, 1, 0, 301, '2023-01-03 10:00:00', NOW());
    `);

    // 6. Seed Product Categories (Level 2 - Children of ID 1)
    await queryRunner.query(`
      INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, active_status, creator_id, created_at, updated_at)
      VALUES 
      (4, 'Điện thoại 123', 11, 1, 2, 1, 301, '2023-01-04 10:00:00', NOW()),
      (5, 'iPhone', 11, 1, 2, 1, 301, '2023-01-05 10:00:00', NOW());
    `);
    
    // 7. Seed Product Categories (Level 3 - Children of ID 4)
    await queryRunner.query(`
      INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, active_status, creator_id, created_at, updated_at)
      VALUES 
      (6, 'Điện thoại 123 Pro', 11, 4, 3, 1, 301, '2023-01-06 10:00:00', NOW());
    `);
  }
}