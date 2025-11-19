// src/shared/application/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError, BusinessRuleViolationError } from '../../domain/errors/domain.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code || this.getErrorCodeFromStatus(status);
      }
    } else if (exception instanceof BusinessRuleViolationError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
      code = 'BUSINESS_RULE_VIOLATION';
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'DOMAIN_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error for monitoring
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'INTERNAL_ERROR';
    }
  }
} 
