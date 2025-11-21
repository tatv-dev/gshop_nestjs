import { DataSource, QueryRunner } from 'typeorm';

/**
 * Database Helper cho Integration và E2E Tests.
 * Quản lý kết nối và rollback transaction để đảm bảo môi trường test sạch.
 */
export class DatabaseHelper {
  private static dataSource: DataSource;

  static async initialize(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = new DataSource({
        type: 'mariadb',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'test_db',
        // Trỏ tới các entity thực tế trong source code (khi chúng được tạo)
        entities: ['src/**/*.model.ts'], 
        synchronize: false, // Luôn dùng migration hoặc raw SQL, không auto-sync trong test
        logging: false,
      });
      await this.dataSource.initialize();
    }
    return this.dataSource;
  }

  static async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  /**
   * Tạo một QueryRunner mới và bắt đầu Transaction.
   * Dùng cái này để chạy test trong isolation.
   */
  static async getQueryRunner(): Promise<QueryRunner> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      await this.initialize();
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   * Rollback transaction và giải phóng connection.
   * Gọi hàm này trong afterEach().
   */
  static async rollbackAndRelease(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner && !queryRunner.isReleased) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }
}