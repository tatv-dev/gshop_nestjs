import { DataSource } from 'typeorm';

/**
 * Create a DataSource for test database
 * Uses environment variables for connection configuration
 */
export function createTestDataSource(): DataSource {
  return new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test_db',
    synchronize: false,
    logging: false,
  });
}
