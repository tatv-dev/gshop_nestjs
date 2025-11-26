import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator to check for duplicate items in an array
 */
@ValidatorConstraint({ name: 'arrayNoDuplicates', async: false })
export class ArrayNoDuplicatesConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!Array.isArray(value)) {
      return true; // Let @IsArray() handle this
    }
    const uniqueValues = new Set(value);
    return uniqueValues.size === value.length;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'array_duplicate_items';
  }
}

/**
 * Decorator to validate that array has no duplicate items
 * Usage: @ArrayNoDuplicates()
 */
export function ArrayNoDuplicates(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'arrayNoDuplicates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ArrayNoDuplicatesConstraint,
    });
  };
}

/**
 * Custom IsString with wrong_type_string message
 */
export function IsStringType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'wrong_type_string',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string';
        },
        defaultMessage(args: ValidationArguments) {
          return 'wrong_type_string';
        },
      },
    });
  };
}

/**
 * Custom IsInt with wrong_type_integer message
 */
export function IsIntegerType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'wrong_type_integer',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Number.isInteger(Number(value));
        },
        defaultMessage(args: ValidationArguments) {
          return 'wrong_type_integer';
        },
      },
    });
  };
}

/**
 * Custom IsArray with wrong_type_array message
 */
export function IsArrayType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'wrong_type_array',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Array.isArray(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'wrong_type_array';
        },
      },
    });
  };
}

/**
 * Custom IsNumber with wrong_type_number message
 */
export function IsNumberType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'wrong_type_number',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && !isNaN(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'wrong_type_number';
        },
      },
    });
  };
}

/**
 * Custom IsBoolean with wrong_type_boolean message
 */
export function IsBooleanType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'wrong_type_boolean',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'boolean';
        },
        defaultMessage(args: ValidationArguments) {
          return 'wrong_type_boolean';
        },
      },
    });
  };
}
