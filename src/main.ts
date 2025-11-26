// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Body parser configuration - increased limit for image uploads (base64 encoded)
  // Note: A 2MB image becomes ~2.7MB when base64 encoded
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    skipMissingProperties: true,
    // IMPORTANT: Do NOT disable error messages - we need them for field-level validation errors
    disableErrorMessages: false,
    exceptionFactory: (errors: ValidationError[]) => {
      // Format validation errors to include full error details for http-exception.filter.ts
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
        children: error.children,
      }));
      return new BadRequestException({
        message: formattedErrors,
        error: 'Bad Request',
        statusCode: 400,
      });
    },
  }));

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000' ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Swagger API documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('POS System API')
      .setDescription('API for Point of Sale system with menu management')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'Authentication endpoints')
      .addTag('Menu - Categories', 'Category management endpoints')
      .addTag('Menu - Items', 'Menu item management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });

  const port = process.env.PORT || 9000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();