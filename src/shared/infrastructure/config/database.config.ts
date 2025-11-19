// src/shared/infrastructure/config/database.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 3306),
      username: this.configService.get('DB_USERNAME', 'root'),
      password: this.configService.get('DB_PASSWORD', ''),
      database: this.configService.get('DB_NAME', ''),
      
      entities: [__dirname + '/../../../**/*.model{.ts,.js}'],
      
      autoLoadEntities: true,
      
      synchronize: false,
      logging: this.configService.get('NODE_ENV') === 'development',
      timezone: '+00:00',
      charset: 'utf8mb4',
      extra: {
        connectionLimit: 10,
      },
      migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/../../../subscribers/*{.ts,.js}'],
    };
  }
}