// src/shared/application/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ApplicationException } from '../exceptions/application.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { InfrastructureException } from '../../infrastructure/exceptions/infrastructure.exception';
import { I18nService } from '../../infrastructure/i18n/i18n.service';

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;          // URI reference that identifies the problem type
  title: string;         // Short, human-readable summary
  status: number;        // HTTP status code
  detail: string;        // Human-readable explanation
  instance: string;      // URI reference for this occurrence
  timestamp?: string;    // When the error occurred
  errors?: Array<{       // Validation errors (if applicable)
    field: string;
    message: string;
  }>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly i18nService: I18nService;

  constructor() {
    this.i18nService = new I18nService();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const problemDetails = this.buildProblemDetails(exception, request);

    // Log error for monitoring
    if (problemDetails.status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else if (problemDetails.status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url}`,
        JSON.stringify(problemDetails),
      );
    }

    response
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }

  private buildProblemDetails(exception: unknown, request: Request): ProblemDetails {
    const instance = `${request.method} ${request.url}`;
    const timestamp = new Date().toISOString();

    // DomainException - Business rule violations (400)
    if (exception instanceof DomainException) {
      const translated = this.i18nService.translate(exception.messageKey, exception.params);
      return {
        type: `https://api.example.com/problems/domain/${exception.messageKey}`,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // ApplicationException - Use case failures (400)
    if (exception instanceof ApplicationException) {
      const translated = this.i18nService.translate(exception.messageKey, exception.params);
      return {
        type: `https://api.example.com/problems/application/${exception.messageKey}`,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // InfrastructureException - Technical failures (500)
    if (exception instanceof InfrastructureException) {
      const translated = this.i18nService.translate(exception.messageKey, exception.params);
      return {
        type: `https://api.example.com/problems/infrastructure/${exception.messageKey}`,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // ValidationException - Input validation errors (422)
    if (exception instanceof ValidationException) {
      const translated = this.i18nService.translate('validation_error');
      return {
        type: 'https://api.example.com/problems/validation_error',
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
        errors: exception.errors.map((error) => {
          const errorTranslated = this.i18nService.translate(error.messageKey, error.params);
          return {
            field: error.field,
            message: errorTranslated.detail,
          };
        }),
      };
    }

    // NestJS BadRequestException (from class-validator)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      const translated = this.i18nService.translate('validation_error');

      // Extract validation errors from class-validator
      const errors: Array<{ field: string; message: string }> = [];
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = exceptionResponse.message;
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (typeof msg === 'string') {
              errors.push({ field: 'unknown', message: msg });
            } else if (typeof msg === 'object' && 'property' in msg) {
              errors.push({
                field: (msg as any).property,
                message: Object.values((msg as any).constraints || {}).join(', '),
              });
            }
          });
        }
      }

      return {
        type: 'https://api.example.com/problems/validation_error',
        title: translated.title,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        detail: translated.detail,
        instance,
        timestamp,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    // NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let title = 'HTTP Error';
      let detail = exception.message;

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        detail = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message.join(', ')
          : String(exceptionResponse.message);
      }

      // Try to get translated message
      const messageKey = this.getMessageKeyFromStatus(status);
      const translated = this.i18nService.translate(messageKey);
      if (translated) {
        title = translated.title;
      }

      return {
        type: `https://api.example.com/problems/http/${status}`,
        title,
        status,
        detail,
        instance,
        timestamp,
      };
    }

    // Generic Error - Internal server error (500)
    this.logger.error(
      `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const translated = this.i18nService.translate('internal_error');
    return {
      type: 'https://api.example.com/problems/internal_error',
      title: translated.title,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: translated.detail,
      instance,
      timestamp,
    };
  }

  private getMessageKeyFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'bad_request';
      case HttpStatus.UNAUTHORIZED:
        return 'auth_invalid_token';
      case HttpStatus.FORBIDDEN:
        return 'permission_denied';
      case HttpStatus.NOT_FOUND:
        return 'resource_not_found';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'validation_error';
      default:
        return 'internal_error';
    }
  }
}
