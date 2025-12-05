import { DataSource, QueryRunner } from 'typeorm';

export const TEST_SOFTWARE_ID = 1;
export const TEST_TENANT_ID = 100000;
export const TEST_USER_ID = 100001;
export const TEST_USER_WITHOUT_PERMISSION_ID = 100002;
export const TEST_WORKSPACE_ID = 100001;
export const TEST_WORKSPACE_WITHOUT_PERMISSION_ID = 100002;
export const TEST_EMPLOYEE_ID = 100001;
export const TEST_EMPLOYEE_ID_2 = 100002;
export const TEST_PERMISSION_ID = 100000;
export const TEST_ROLE_WITH_PERMISSION_ID = 100001;
export const TEST_ROLE_WITHOUT_PERMISSION_ID = 100002;
export const TEST_PARENT_CATEGORY_ID = 100010;
export const TEST_CHILD_CATEGORY_ID = 100011;
export const REQUIRED_PERMISSION_NAME = 'GET_LIST_PRODUCT_CATEGORY';

export const TEST_USER_CREDENTIALS = {
  username: 'user.with.permission',
  password: 'Test@123456',
  softwareId: TEST_SOFTWARE_ID,
};

export const TEST_USER_WITHOUT_PERMISSION_CREDENTIALS = {
  username: 'user.without.permission',
  password: 'Test@123456',
  softwareId: TEST_SOFTWARE_ID,
};

export async function seedTestData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await seedSoftwares(queryRunner);
    await seedTenants(queryRunner);
    await seedUsers(queryRunner);
    await seedWorkspaces(queryRunner);
    await seedEmployees(queryRunner);
    await seedRoles(queryRunner);
    await seedPermissions(queryRunner);
    await seedRolePermissions(queryRunner);
    await seedRoleWorkspaces(queryRunner);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function cleanup(dataSource: DataSource) {
  const dbName = process.env.DB_DATABASE;
  if (!dbName) throw new Error("Missing DB_DATABASE in environment");

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    // Lấy danh sách các bảng trong schema
    const tables: Array<{ table_name: string }> = await queryRunner.query(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = ?
      `,
      [dbName],
    );

    // Tạo danh sách câu lệnh TRUNCATE
    for (const { table_name } of tables) {
      await queryRunner.query(`TRUNCATE TABLE \`${table_name}\``);
    }

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    await queryRunner.release();
  }
}


export async function seedSoftwares(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT IGNORE INTO softwares (id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [TEST_SOFTWARE_ID, 'Test Software']
  );
}

export async function seedTenants(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO tenants (id, name, status, remaining_account_quota, total_account_quota, created_at, updated_at) VALUES (?, ?, 1, 0, 0, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name)',
    [TEST_TENANT_ID, 'Tenant E2E']
  );
}

export async function seedUsers(queryRunner: QueryRunner) {
  const passwordHash = '$2b$10$XDbn1ClPLLwR3.Os1H3NP.2xfiTELB/rz.I3oozUHYGpE37Z2WN.y';
  await queryRunner.query(
    'INSERT INTO users (id, user_name, password, phone_number, created_at, updated_at, lock_counter, auto_lock_time) VALUES (?, ?, ?, NULL, NOW(), NOW(), NULL, NULL) ON DUPLICATE KEY UPDATE user_name = VALUES(user_name), password = VALUES(password)',
    [TEST_USER_ID, TEST_USER_CREDENTIALS.username, passwordHash]
  );
  await queryRunner.query(
    'INSERT INTO users (id, user_name, password, phone_number, created_at, updated_at, lock_counter, auto_lock_time) VALUES (?, ?, ?, NULL, NOW(), NOW(), NULL, NULL) ON DUPLICATE KEY UPDATE user_name = VALUES(user_name), password = VALUES(password)',
    [TEST_USER_WITHOUT_PERMISSION_ID, TEST_USER_WITHOUT_PERMISSION_CREDENTIALS.username, passwordHash]
  );
}

export async function seedWorkspaces(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO workspaces (id, status, user_id, tenant_id, created_at, updated_at) VALUES (?, 1, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), tenant_id = VALUES(tenant_id)',
    [TEST_WORKSPACE_ID, TEST_USER_ID, TEST_TENANT_ID]
  );
  await queryRunner.query(
    'INSERT INTO workspaces (id, status, user_id, tenant_id, created_at, updated_at) VALUES (?, 1, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), tenant_id = VALUES(tenant_id)',
    [TEST_WORKSPACE_WITHOUT_PERMISSION_ID, TEST_USER_WITHOUT_PERMISSION_ID, TEST_TENANT_ID]
  );
}

export async function seedEmployees(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO employees (id, name, workspace_id, reseller_id, branch_id, status, dob, email, gender, address, note, created_at, creator_id, type, updated_at) VALUES (?, ?, ?, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NOW(), NULL, 1, NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), workspace_id = VALUES(workspace_id)',
    [TEST_EMPLOYEE_ID, 'Admin E2E', TEST_WORKSPACE_ID]
  );
  await queryRunner.query(
    'INSERT INTO employees (id, name, workspace_id, reseller_id, branch_id, status, dob, email, gender, address, note, created_at, creator_id, type, updated_at) VALUES (?, ?, ?, NULL, NULL, 1, NULL, NULL, 1, NULL, NULL, NOW(), NULL, 1, NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), workspace_id = VALUES(workspace_id)',
    [TEST_EMPLOYEE_ID_2, 'Staff E2E', TEST_WORKSPACE_WITHOUT_PERMISSION_ID]
  );
}

export async function seedPermissions(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO permissions (id, name, software_id, permission_parent_id, type, display_name, created_at, updated_at) VALUES (?, ?, ?, NULL, 1, NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), software_id = VALUES(software_id)',
    [TEST_PERMISSION_ID, REQUIRED_PERMISSION_NAME, TEST_SOFTWARE_ID]
  );
}

export async function seedRoles(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO roles (id, name, note, creator_id, created_at, tenant_id, type, updated_at) VALUES (?, ?, NULL, ?, NOW(), ?, 2, NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), tenant_id = VALUES(tenant_id)',
    [TEST_ROLE_WITH_PERMISSION_ID, 'Admin E2E', TEST_EMPLOYEE_ID, TEST_TENANT_ID]
  );
  await queryRunner.query(
    'INSERT INTO roles (id, name, note, creator_id, created_at, tenant_id, type, updated_at) VALUES (?, ?, NULL, ?, NOW(), ?, 2, NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), tenant_id = VALUES(tenant_id)',
    [TEST_ROLE_WITHOUT_PERMISSION_ID, 'Staff E2E', TEST_EMPLOYEE_ID, TEST_TENANT_ID]
  );
}

export async function seedRolePermissions(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [TEST_ROLE_WITH_PERMISSION_ID, TEST_PERMISSION_ID]
  );
}

export async function seedRoleWorkspaces(queryRunner: QueryRunner) {
  await queryRunner.query(
    'INSERT INTO role_workspaces (workspace_id, role_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [TEST_WORKSPACE_ID, TEST_ROLE_WITH_PERMISSION_ID]
  );
  await queryRunner.query(
    'INSERT INTO role_workspaces (workspace_id, role_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
    [TEST_WORKSPACE_WITHOUT_PERMISSION_ID, TEST_ROLE_WITHOUT_PERMISSION_ID]
  );
}

export async function seedProductCategoriesTestData(queryRunner: QueryRunner) {
  // Parent category
  await queryRunner.query(
    'INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, created_at, updated_at, parent_level1_id, parent_level2_id, active_status, creator_id) VALUES (?, ?, ?, NULL, 1, NOW(), NOW(), NULL, NULL, 1, ?)',
    [TEST_PARENT_CATEGORY_ID, 'Điện thoại 123', TEST_TENANT_ID, TEST_EMPLOYEE_ID]
  );
  // Child category under parent
  await queryRunner.query(
    'INSERT INTO product_categories (id, name, tenant_id, product_category_parent_id, level, created_at, updated_at, parent_level1_id, parent_level2_id, active_status, creator_id) VALUES (?, ?, ?, ?, 2, NOW(), NOW(), ?, NULL, 0, ?)',
    [TEST_CHILD_CATEGORY_ID, 'Điện thoại 12311111', TEST_TENANT_ID, TEST_PARENT_CATEGORY_ID, TEST_PARENT_CATEGORY_ID, TEST_EMPLOYEE_ID]
  );
}
