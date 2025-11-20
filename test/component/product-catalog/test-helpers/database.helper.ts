// test/component/product-catalog/test-helpers/database.helper.ts
import { DataSource, QueryRunner } from 'typeorm';
import { ProductCategoryModel } from '../../../../src/components/product-catalog/infrastructure/entities/product-category.model';

/**
 * Database Test Helper
 * Provides utilities for database operations in tests
 */

let dataSource: DataSource;
let queryRunner: QueryRunner;

/**
 * Initialize database connection for tests
 */
export async function initializeTestDatabase(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE_TEST || 'gshop_test',
    entities: [ProductCategoryModel],
    synchronize: false, // Use migrations, not auto-sync
    logging: process.env.DB_LOGGING === 'true',
  });

  await dataSource.initialize();
  return dataSource;
}

/**
 * Get or create DataSource instance
 */
export function getTestDataSource(): DataSource {
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error('DataSource not initialized. Call initializeTestDatabase() first.');
  }
  return dataSource;
}

/**
 * Create a new QueryRunner with transaction support
 */
export async function createTestQueryRunner(): Promise<QueryRunner> {
  const ds = getTestDataSource();
  queryRunner = ds.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
}

/**
 * Rollback transaction and release QueryRunner
 */
export async function rollbackTestTransaction(qr: QueryRunner): Promise<void> {
  if (qr.isTransactionActive) {
    await qr.rollbackTransaction();
  }
  await qr.release();
}

/**
 * Close database connection
 */
export async function closeTestDatabase(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
}

/**
 * Execute raw SQL query (for seeding)
 */
export async function executeRawSql(qr: QueryRunner, sql: string, parameters?: any[]): Promise<any> {
  return await qr.query(sql, parameters);
}

/**
 * Truncate tables in correct order (reverse dependency)
 * Use this for cleanup when NOT using transactions
 */
export async function truncateTables(qr: QueryRunner): Promise<void> {
  // Disable foreign key checks
  await qr.query('SET FOREIGN_KEY_CHECKS = 0');

  // Truncate in reverse dependency order
  await qr.query('TRUNCATE TABLE product_categories');
  // Add other tables as needed
  // await qr.query('TRUNCATE TABLE tenants');

  // Re-enable foreign key checks
  await qr.query('SET FOREIGN_KEY_CHECKS = 1');
}
