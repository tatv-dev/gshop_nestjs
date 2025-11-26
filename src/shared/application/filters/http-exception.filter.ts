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
import { ApplicationErrorException } from '../exceptions/application-error.exception';
import { AuthErrorException } from '../exceptions/auth-error.exception';
import { BusinessErrorException } from '../exceptions/business-error.exception';
import { SystemErrorException } from '../exceptions/system-error.exception';

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  messageKey: string;    // Message key for i18n lookup
  title: string;         // Short, human-readable summary
  status: number;        // HTTP status code
  detail: string;        // Human-readable explanation
  instance: string;      // URI reference for this occurrence
  timestamp?: string;    // When the error occurred
  errors?: Array<{       // Field-level validation errors (if applicable)
    field: string;
    receivedValue: any;
    messageKey: string;
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

    // ApplicationErrorException - Application errors (missing_parameter, etc.)
    if (exception instanceof ApplicationErrorException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // AuthErrorException - Authentication/Authorization errors
    if (exception instanceof AuthErrorException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // BusinessErrorException - Business logic errors
    if (exception instanceof BusinessErrorException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // SystemErrorException - System/Infrastructure errors
    if (exception instanceof SystemErrorException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // DomainException - Business rule violations (400)
    if (exception instanceof DomainException) {
      // Auto-detect type: validation messages vs error messages
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // ApplicationException - Use case failures (400)
    if (exception instanceof ApplicationException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // InfrastructureException - Technical failures (500)
    if (exception instanceof InfrastructureException) {
      const messageKey = this.getFullMessageKey(exception.messageKey);
      const translated = this.i18nService.translate(messageKey, exception.params);
      return {
        messageKey: exception.messageKey,
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
      };
    }

    // ValidationException - Input validation errors (422)
    if (exception instanceof ValidationException) {
      const translated = this.i18nService.translate('error.validation_error');
      return {
        messageKey: 'validation_error',
        title: translated.title,
        status: exception.httpStatus,
        detail: translated.detail,
        instance: exception.instance || instance,
        timestamp,
        errors: exception.errors.map((error) => ({
          field: error.field,
          receivedValue: (error as any).receivedValue,
          messageKey: `validation_error.${error.messageKey}`,
        })),
      };
    }

    // NestJS BadRequestException (from class-validator)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      const translated = this.i18nService.translate('error.validation_error');

      // Debug logging
      this.logger.debug('BadRequestException response:', JSON.stringify(exceptionResponse, null, 2));

      // Extract validation errors from class-validator (including nested errors)
      const errors: Array<{ field: string; receivedValue: any; messageKey: string }> = [];
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = exceptionResponse.message;

        // Debug logging
        this.logger.debug('Messages:', JSON.stringify(messages, null, 2));

        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (typeof msg === 'object' && 'property' in msg) {
              // Extract both top-level and nested validation errors
              const extractedErrors = this.extractValidationErrors(msg, '');
              errors.push(...extractedErrors);
            }
          });
        }
      }

      this.logger.debug('Formatted errors:', JSON.stringify(errors, null, 2));

      return {
        messageKey: 'validation_error',
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
      const messageKeyShort = this.getMessageKeyFromStatus(status);
      const messageKey = `error.${messageKeyShort}`;
      const translated = this.i18nService.translate(messageKey);
      if (translated) {
        title = translated.title;
      }

      return {
        messageKey: messageKeyShort,
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

    const translated = this.i18nService.translate('error.internal_error');
    return {
      messageKey: 'internal_error',
      title: translated.title,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: translated.detail,
      instance,
      timestamp,
    };
  }

  /**
   * Auto-detect message type and return full message key
   * Validation standard keys: required, filled, present, numeric, integer, string, boolean, array, email,
   *                           max, min, between, confirmed, date, date_format, after, before, unique, in, regex, url
   * All others are error messages
   */
  private getFullMessageKey(messageKey: string): string {
    const validationKeys = [
      'required', 'filled', 'present', 'numeric', 'integer', 'string', 'boolean', 'array', 'email',
      'max', 'min', 'between', 'confirmed', 'date', 'date_format', 'after', 'before', 'unique', 'in', 'regex', 'url'
    ];

    // Check if messageKey starts with any validation key
    const isValidation = validationKeys.some(key => messageKey === key || messageKey.startsWith(`${key}.`));

    return isValidation ? `validation.${messageKey}` : `error.${messageKey}`;
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

  /**
   * Recursively extract validation errors including nested errors (e.g., array elements)
   * Builds field paths like "productCategoryAncestors[1]" for array element errors
   */
  private extractValidationErrors(
    error: any,
    parentPath: string,
  ): Array<{ field: string; receivedValue: any; messageKey: string }> {
    const results: Array<{ field: string; receivedValue: any; messageKey: string }> = [];
    const property = error.property;
    const value = error.value;
    const constraints = error.constraints || {};
    const children = error.children || [];

    // Build current field path
    const currentPath = parentPath ? `${parentPath}.${property}` : property;

    // If this error has constraints (validation rules), add it to results
    const constraintKeys = Object.keys(constraints);
    if (constraintKeys.length > 0) {
      const constraintType = constraintKeys[0];
      const messageKey = this.mapConstraintToMessageKey(constraintType);
      results.push({
        field: currentPath,
        receivedValue: value,
        messageKey: `validation_error.${messageKey}`,
      });
    }

    // Recursively extract nested errors (for array elements, nested objects, etc.)
    if (children.length > 0) {
      children.forEach((child: any) => {
        // For array elements, use array notation: field[index]
        const isArrayElement = !isNaN(parseInt(child.property, 10));
        const childPath = isArrayElement
          ? `${currentPath}[${child.property}]`
          : currentPath;

        const nestedErrors = this.extractValidationErrors(child, childPath);
        results.push(...nestedErrors);
      });
    }

    return results;
  }

  /**
   * Map class-validator constraint types to custom message keys
   */
  private mapConstraintToMessageKey(constraintType: string): string {
    const constraintMap: Record<string, string> = {
      // Type validations
      isString: 'wrong_type_string',
      isInt: 'wrong_type_integer',
      isNumber: 'wrong_type_number',
      isBoolean: 'wrong_type_boolean',
      isArray: 'wrong_type_array',
      isObject: 'wrong_type_object',
      isDate: 'wrong_type_date',

      // Custom validators (already have correct names)
      wrong_type_string: 'wrong_type_string',
      wrong_type_integer: 'wrong_type_integer',
      wrong_type_number: 'wrong_type_number',
      wrong_type_boolean: 'wrong_type_boolean',
      wrong_type_array: 'wrong_type_array',
      wrong_type_object: 'wrong_type_object',
      arrayNoDuplicates: 'array_duplicate_items',

      // Common validations
      isNotEmpty: 'required',
      isOptional: 'optional',
      min: 'min_value',
      max: 'max_value',
      minLength: 'min_length',
      maxLength: 'max_length',
      isEmail: 'invalid_email',
      isUrl: 'invalid_url',
      isIn: 'invalid_value',
      isNotIn: 'forbidden_value',
      arrayNotEmpty: 'array_empty',
      arrayMinSize: 'array_min_size',
      arrayMaxSize: 'array_max_size',
    };

    return constraintMap[constraintType] || constraintType;
  }
}
