// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Configuration
import { DatabaseConfig } from './shared/infrastructure/config/database.config';

// Modules
import { AuthenticationModule } from './components/authentication/authentication.module';
import { ProductCatalogModule } from './components/product-catalog/product-catalog.module';

// Global filters and interceptors
import { AllExceptionsFilter } from './shared/application/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/application/interceptors/logging.interceptor';
import { RawInputCaptureInterceptor } from './shared/application/interceptors/raw-input-capture.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    EventEmitterModule.forRoot(),
    CqrsModule,
    AuthenticationModule,
    ProductCatalogModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RawInputCaptureInterceptor,
    },
  ],
})
export class AppModule {}
