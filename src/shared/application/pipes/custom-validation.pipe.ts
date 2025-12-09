import {

  PipeTransform,

  Injectable,

  ArgumentMetadata,

  BadRequestException,

} from '@nestjs/common';

import { ValidationPipe } from '@nestjs/common';

import { ValidationException } from '../exceptions/validation.exception';

import { formatValidationErrors } from './validation-error-formatter';

 

/**

 * Custom ValidationPipe that captures raw input values for error reporting

 */

@Injectable()

export class CustomValidationPipe extends ValidationPipe implements PipeTransform<any> {

  private rawInput: any;

 

  async transform(value: any, metadata: ArgumentMetadata) {

    // Capture raw input before transformation

    this.rawInput = this.cloneValue(value);

    try {

      // Call parent transform

      return await super.transform(value, metadata);

    } catch (error) {

      // If it's a BadRequestException from class-validator, convert to ValidationException

      if (error instanceof BadRequestException) {

        const response = error.getResponse() as any;

 

        if (response && Array.isArray(response.message)) {

          const formattedErrors = formatValidationErrors(response.message);

 

          // Extract raw values from captured input

          const errorsWithRawValues = formattedErrors.map((err) => {

            const rawValue = this.extractRawValue(err.property, this.rawInput);

            return {

              field: err.property,

              value: rawValue !== undefined ? rawValue : err.value,

              messageKey: this.mapConstraintToMessageKey(err.constraints),

            };

          });

 

          throw new ValidationException({
            messageKey: 'general',
            params: {},
            instance: undefined,
            errors: errorsWithRawValues,

          });

        }

      }

 

      // Re-throw other errors

      throw error;

    }

  }

 

  /**

   * Clone input value to preserve raw values

   */

  private cloneValue(value: any): any {

    if (value === null || value === undefined) {

      return value;

    }

    if (typeof value === 'object') {

      return JSON.parse(JSON.stringify(value));

    }

    return value;

  }

 

  /**

   * Extract raw value from input using property path (e.g., "productCategoryAncestors[1]")

   */

  private extractRawValue(propertyPath: string, rawInput: any): any {

    if (!rawInput || typeof rawInput !== 'object') {

      return undefined;

    }

 

    // Parse property path: "productCategoryAncestors[1]" -> ["productCategoryAncestors", "1"]

    const arrayMatch = propertyPath.match(/^(.+?)\[(\d+)\]$/);

 

    if (arrayMatch) {

      const [, fieldName, index] = arrayMatch;

      const arrayValue = rawInput[fieldName];

 

      if (Array.isArray(arrayValue)) {

        return arrayValue[parseInt(index, 10)];

      }

 

      // If raw value is string (e.g., "[1,\"+\"]"), parse it

      if (typeof arrayValue === 'string') {

        try {

          const parsed = JSON.parse(arrayValue);

          if (Array.isArray(parsed)) {

            return parsed[parseInt(index, 10)];

          }

        } catch (e) {

          // Not valid JSON, try simple split

          const cleaned = arrayValue.replace(/^\[|\]$/g, '');

          const items = cleaned.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));

          return items[parseInt(index, 10)];

        }

      }

    }

 

    // Simple property access

    return rawInput[propertyPath];

  }

 

  /**

   * Map constraint object to message key

   */

  private mapConstraintToMessageKey(constraints: Record<string, any>): string {

    const constraintMap: Record<string, string> = {

      isString: 'wrong_type_string',

      isInt: 'wrong_type_integer',

      isNumber: 'wrong_type_number',

      isBoolean: 'wrong_type_boolean',

      isArray: 'wrong_type_array',

      isObject: 'wrong_type_object',

      arrayNoDuplicates: 'array_duplicate_items',

      isNotEmpty: 'required',

      min: 'min_value',

      max: 'max_value',

      minLength: 'min_length',

      maxLength: 'max_length',

      isEmail: 'invalid_email',

      isUrl: 'invalid_url',

      isIn: 'invalid_value',

      isNotIn: 'forbidden_value',

      arrayNotEmpty: 'array_empty',

    };

 

    const constraintKeys = Object.keys(constraints);

    if (constraintKeys.length === 0) {

      return 'invalid';

    }

 

    const constraintType = constraintKeys[0];

    return `validation_error.${constraintMap[constraintType] || constraintType}`;

  }

}