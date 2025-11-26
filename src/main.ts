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
      // Recursive function to flatten validation errors including array element errors
      const flattenErrors = (error: ValidationError, parentPath = ''): any[] => {
        const results: any[] = [];
        const property = error.property;
        const value = error.value;
        const constraints = error.constraints || {};
        const children = error.children || [];
        const contexts = (error as any).contexts || {};

        // Build current field path
        const currentPath = parentPath ? `${parentPath}.${property}` : property;

        // Check if this is an array validation with "each: true"
        // In this case, we need to expand to individual element errors
        if (Array.isArray(value) && Object.keys(constraints).length > 0) {
          // Check if constraints indicate array element validation
          const isArrayElementValidation = Object.keys(constraints).some(key => {
            // Common validators that use { each: true }
            return ['isInt', 'isString', 'min', 'max', 'isIn', 'isNotIn'].includes(key);
          });

          if (isArrayElementValidation) {
            // Expand to individual element errors
            value.forEach((elementValue, index) => {
              // Check if this element would fail validation
              let hasError = false;
              let failedConstraint = null;

              // Check each constraint
              for (const [constraintKey, constraintMessage] of Object.entries(constraints)) {
                // Simple validation checks for common validators
                if (constraintKey === 'isInt' && !Number.isInteger(elementValue)) {
                  hasError = true;
                  failedConstraint = constraintKey;
                  break;
                } else if (constraintKey === 'min' && elementValue < contexts[constraintKey]?.min) {
                  hasError = true;
                  failedConstraint = constraintKey;
                  break;
                } else if (constraintKey === 'max' && elementValue > contexts[constraintKey]?.max) {
                  hasError = true;
                  failedConstraint = constraintKey;
                  break;
                } else if (constraintKey === 'isString' && typeof elementValue !== 'string') {
                  hasError = true;
                  failedConstraint = constraintKey;
                  break;
                }
              }

              if (hasError && failedConstraint) {
                results.push({
                  property: `${currentPath}[${index}]`,
                  value: elementValue,
                  constraints: { [failedConstraint]: constraints[failedConstraint] },
                  children: [],
                });
              }
            });

            // If we found element-level errors, don't add the top-level error
            if (results.length > 0) {
              return results;
            }
          }
        }

        // Top-level error (no element expansion or non-array)
        if (Object.keys(constraints).length > 0) {
          results.push({
            property: currentPath,
            value: value,
            constraints: constraints,
            children: children,
          });
        }

        // Recursively process children
        if (children.length > 0) {
          children.forEach((child) => {
            const childErrors = flattenErrors(child, currentPath);
            results.push(...childErrors);
          });
        }

        return results;
      };

      // Flatten all errors
      const formattedErrors: any[] = [];
      errors.forEach((error) => {
        const flattened = flattenErrors(error);
        formattedErrors.push(...flattened);
      });

      console.log('Formatted errors:', JSON.stringify(formattedErrors, null, 2));

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