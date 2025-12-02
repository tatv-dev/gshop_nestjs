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

/**
 * Custom IsStrictString
 */
export function IsStrictString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrictString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string`;
        },
      },
    });
  };
}


// Helper to transform query string arrays (e.g., "[1,0]" or "1,0" -> [1, 0])
// Preserves invalid values for proper validation error reporting
export function transformToIntArray ({ value }) {
  console.log("transformToIntArray: ", value)
  // If already array, keep as-is to preserve original values for validation
  if (Array.isArray(value)) {
    return value.map(v => {
      const num = parseInt(v, 10);
      return isNaN(num) ? v : num;
    });
  }

  if (typeof value === 'string') {
    // Chỉ chấp nhận string có [] bao quanh
    if (!/^\[.*\]$/.test(value)) {
      // Nếu không có dấu [], trả về nguyên string để validator báo lỗi
      return value;
    }

    // Handle "[1,0]" format
    const cleaned = value.replace(/^\[|\]$/g, '');
    if (!cleaned) return [];

    const parts = cleaned.split(',');
    const transformed = parts.map((v) => {
      const trimmed = v.trim();
      const num = parseInt(trimmed, 10);
      // Preserve original value if parsing fails
      return isNaN(num) ? trimmed : num;
    });

    // Nếu bất kỳ phần tử nào không parse được, trả về nguyên string để validator báo lỗi
    if (transformed.some(v => typeof v === 'string')) {
      return value;
    }

    return transformed;
  }


  return value;
};

// Helper to transform to integer (preserves invalid values for validation)
export function transformToInt({ value }) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    // If parse fails, keep original to let validator catch it
    return isNaN(num) ? value : num;
  }
  return value;
};


export function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value]; // convert single value thành array
}

