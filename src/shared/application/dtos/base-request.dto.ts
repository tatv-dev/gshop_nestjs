// src/shared/application/dtos/base-request.dto.ts
import { ValidationError } from 'class-validator';

export interface FormattedValidationError {
  field: string;
  value: any;
  messageKey: string;
}

export abstract class BaseRequestDTO {
  /**
   * Transform class-validator ValidationError[] to formatted error array
   * Maps constraint types to standardized message keys
   */
  static transformValidationErrors(errors: ValidationError[]): FormattedValidationError[] {
    const formattedErrors: FormattedValidationError[] = [];

    for (const error of errors) {
      this.flattenValidationError(error, '', formattedErrors);
    }

    return formattedErrors;
  }

  /**
   * Recursively flatten nested validation errors (e.g., array elements)
   */
  private static flattenValidationError(
    error: ValidationError,
    parentPath: string,
    results: FormattedValidationError[],
  ): void {
    const property = error.property;
    const value = error.value;
    const constraints = error.constraints || {};
    const children = error.children || [];

    // Build current field path
    const currentPath = parentPath ? `${parentPath}.${property}` : property;

    // Check if this is an array validation with "each: true"
    if (Array.isArray(value) && Object.keys(constraints).length > 0) {
      const isArrayElementValidation = Object.keys(constraints).some((key) =>
        ['isInt', 'isString', 'min', 'max', 'isIn', 'isNotIn'].includes(key),
      );

      if (isArrayElementValidation) {
        // Expand to individual element errors
        value.forEach((elementValue, index) => {
          // Check each constraint
          for (const [constraintKey, constraintMessage] of Object.entries(constraints)) {
            let hasError = false;

            // Simple validation checks
            if (constraintKey === 'isInt' && !Number.isInteger(elementValue)) {
              hasError = true;
            } else if (constraintKey === 'min' && elementValue < (error as any).contexts?.[constraintKey]?.min) {
              hasError = true;
            } else if (constraintKey === 'max' && elementValue > (error as any).contexts?.[constraintKey]?.max) {
              hasError = true;
            } else if (constraintKey === 'isString' && typeof elementValue !== 'string') {
              hasError = true;
            } else if (constraintKey === 'isIn') {
              const allowedValues = (error as any).contexts?.[constraintKey]?.allowedValues || [];
              if (!allowedValues.includes(elementValue)) {
                hasError = true;
              }
            } else if (constraintKey === 'isNotIn') {
              const forbiddenValues = (error as any).contexts?.[constraintKey]?.forbiddenValues || [];
              if (forbiddenValues.includes(elementValue)) {
                hasError = true;
              }
            }

            if (hasError) {
              const messageKey = this.mapConstraintToMessageKey(constraintKey);
              results.push({
                field: `${currentPath}[${index}]`,
                value: elementValue,
                messageKey: `validation_error.${messageKey}`,
              });
              break; // Only report first error per element
            }
          }
        });

        // If we found element-level errors, don't add the top-level error
        if (results.some(r => r.field.startsWith(`${currentPath}[`))) {
          return;
        }
      }
    }

    // Top-level error (no element expansion or non-array)
    if (Object.keys(constraints).length > 0) {
      // PRIORITY: Get the most important constraint (type checking first)
      const constraintType = this.getPriorityConstraint(Object.keys(constraints));
      const messageKey = this.mapConstraintToMessageKey(constraintType);

      results.push({
        field: currentPath,
        value: value,
        messageKey: `validation_error.${messageKey}`,
      });
    }

    // Recursively process children (for nested objects)
    if (children.length > 0) {
      children.forEach((child) => {
        this.flattenValidationError(child, currentPath, results);
      });
    }
  }

  /**
   * Get the most important constraint from a list of constraint keys
   * Prioritize type checking constraints over value constraints
   */
  private static getPriorityConstraint(constraintKeys: string[]): string {
    // Priority order (highest to lowest):
    // 1. Type validators (isString, isInt, isArray, etc.)
    // 2. Custom type validators (wrong_type_string, etc.)
    // 3. Structure validators (arrayNotEmpty, arrayNoDuplicates)
    // 4. Value validators (min, max, isIn, etc.)
    
    const typeValidators = ['isString', 'isInt', 'isNumber', 'isBoolean', 'isArray', 'isObject', 'isDate'];
    const customTypeValidators = ['wrong_type_string', 'wrong_type_integer', 'wrong_type_number', 'wrong_type_boolean', 'wrong_type_array', 'wrong_type_object'];
    const structureValidators = ['arrayNotEmpty', 'arrayNoDuplicates', 'isNotEmpty'];
    
    // Debug: Log all constraints
    console.log('[getPriorityConstraint] Available constraints:', constraintKeys);
    
    // Priority 1: Type validators
    for (const validator of typeValidators) {
      if (constraintKeys.includes(validator)) {
        console.log('[getPriorityConstraint] Selected type validator:', validator);
        return validator;
      }
    }

    // Priority 2: Custom type validators
    for (const validator of customTypeValidators) {
      if (constraintKeys.includes(validator)) {
        console.log('[getPriorityConstraint] Selected custom type validator:', validator);
        return validator;
      }
    }

    // Priority 3: Structure validators
    for (const validator of structureValidators) {
      if (constraintKeys.includes(validator)) {
        console.log('[getPriorityConstraint] Selected structure validator:', validator);
        return validator;
      }
    }

    // Priority 4: Return first constraint
    console.log('[getPriorityConstraint] No priority constraint found, using first:', constraintKeys[0]);
    return constraintKeys[0];
  }

  /**
   * Map class-validator constraint types to custom message keys
   */
  private static mapConstraintToMessageKey(constraintType: string): string {
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