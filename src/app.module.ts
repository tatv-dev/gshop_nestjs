// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Configuration
import { DatabaseConfig } from './shared/infrastructure/config/database.config';

// Modules
import { AuthenticationModule } from './components/authentication/authentication.module';
import { ProductCatalogModule } from './components/product-catalog/product-catalog.module';
// import { MenuModule } from './components/menu/menu.module';
// import { RestaurantTableModule } from './components/restaurant-table/restaurant-table.module';
// import { DiscountModule } from './components/discount/discount.module';
// import { ReportModule } from './components/report/report.module';
// import { ProfileModule } from './components/profile/profile.module';
// import { OrderModule } from './components/orders/order.module';
// import { PaymentModule } from './components/payments/payment.module';
// import { SettingModule } from './components/settings/setting.module';

// Global filters and interceptors
import { AllExceptionsFilter } from './shared/application/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/application/interceptors/logging.interceptor';

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
    // MenuModule,
    // RestaurantTableModule,
    // DiscountModule,
    // ReportModule,
    // ProfileModule,
    // OrderModule,
    // PaymentModule,
    // SettingModule,
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
  ],
})
export class AppModule {}
