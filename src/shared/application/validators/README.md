# Custom Validators

Hệ thống validation tùy chỉnh với message keys chuẩn hóa cho field-level validation errors.

## Validation Error Format

Khi validation fails, API trả về format sau:

```json
{
  "messageKey": "validation_error",
  "title": "Lỗi xác thực dữ liệu",
  "status": 422,
  "detail": "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.",
  "instance": "GET /api/v1/endpoint",
  "timestamp": "2025-11-26T10:30:00+07:00",
  "errors": [
    {
      "field": "productCategoryName",
      "receivedValue": 123,
      "messageKey": "validation_error.wrong_type_string"
    },
    {
      "field": "activeStatuses",
      "receivedValue": [1, 1],
      "messageKey": "validation_error.array_duplicate_items"
    }
  ]
}
```

## Custom Validators

### Type Validators

#### `@IsStringType()`
Validates that value is a string type.
- **messageKey**: `validation_error.wrong_type_string`

```typescript
@IsStringType()
productCategoryName?: string;
```

#### `@IsIntegerType()`
Validates that value is an integer type.
- **messageKey**: `validation_error.wrong_type_integer`

```typescript
@IsIntegerType()
page?: number;
```

#### `@IsArrayType()`
Validates that value is an array type.
- **messageKey**: `validation_error.wrong_type_array`

```typescript
@IsArrayType()
activeStatuses?: number[];
```

#### `@IsNumberType()`
Validates that value is a number type.
- **messageKey**: `validation_error.wrong_type_number`

```typescript
@IsNumberType()
price?: number;
```

#### `@IsBooleanType()`
Validates that value is a boolean type.
- **messageKey**: `validation_error.wrong_type_boolean`

```typescript
@IsBooleanType()
isActive?: boolean;
```

### Array Validators

#### `@ArrayNoDuplicates()`
Validates that array has no duplicate items.
- **messageKey**: `validation_error.array_duplicate_items`

```typescript
@ArrayNoDuplicates()
activeStatuses?: number[];
```

## Standard Validators with Custom Message Keys

Standard class-validator decorators được tự động map sang custom message keys:

| Decorator | Constraint Type | Message Key |
|-----------|----------------|-------------|
| `@IsString()` | isString | `validation_error.wrong_type_string` |
| `@IsInt()` | isInt | `validation_error.wrong_type_integer` |
| `@IsNumber()` | isNumber | `validation_error.wrong_type_number` |
| `@IsBoolean()` | isBoolean | `validation_error.wrong_type_boolean` |
| `@IsArray()` | isArray | `validation_error.wrong_type_array` |
| `@IsNotEmpty()` | isNotEmpty | `validation_error.required` |
| `@Min(n)` | min | `validation_error.min_value` |
| `@Max(n)` | max | `validation_error.max_value` |
| `@MinLength(n)` | minLength | `validation_error.min_length` |
| `@MaxLength(n)` | maxLength | `validation_error.max_length` |
| `@IsEmail()` | isEmail | `validation_error.invalid_email` |
| `@ArrayNotEmpty()` | arrayNotEmpty | `validation_error.array_empty` |

## Ví dụ sử dụng trong Request DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  Max,
  IsIn,
  ValidateIf,
  IsNotIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ArrayNoDuplicates } from '../../../../shared/application/validators/custom-validators';

export class GetListProductCategoryRequest {
  // Optional string field
  @ValidateIf((o) => o.productCategoryName !== undefined)
  @IsNotIn([null])
  @IsString() // Auto-mapped to validation_error.wrong_type_string
  productCategoryName?: string;

  // Optional array with no duplicates
  @ValidateIf((o) => o.activeStatuses !== undefined)
  @IsNotIn([null])
  @Transform(transformToIntArray)
  @IsArray() // Auto-mapped to validation_error.wrong_type_array
  @ArrayNotEmpty() // Auto-mapped to validation_error.array_empty
  @ArrayNoDuplicates() // Custom: validation_error.array_duplicate_items
  @IsInt({ each: true }) // Auto-mapped to validation_error.wrong_type_integer (for each item)
  @IsIn([0, 1], { each: true })
  activeStatuses?: number[];

  // Optional integer with range
  @ValidateIf((o) => o.page !== undefined)
  @IsNotIn([null])
  @Type(() => Number)
  @IsInt() // Auto-mapped to validation_error.wrong_type_integer
  @Min(1) // Auto-mapped to validation_error.min_value
  @Max(1000) // Auto-mapped to validation_error.max_value
  page?: number;
}
```

## Test Cases

### Test Case 1: Wrong type errors
**Input:**
```json
{
  "productCategoryName": 123,
  "activeStatuses": "abc",
  "page": "abc"
}
```

**Expected Response (422):**
```json
{
  "errors": [
    {
      "field": "productCategoryName",
      "receivedValue": 123,
      "messageKey": "validation_error.wrong_type_string"
    },
    {
      "field": "activeStatuses",
      "receivedValue": "abc",
      "messageKey": "validation_error.wrong_type_array"
    },
    {
      "field": "page",
      "receivedValue": "abc",
      "messageKey": "validation_error.wrong_type_integer"
    }
  ]
}
```

### Test Case 2: Array duplicate items
**Input:**
```json
{
  "activeStatuses": [1, 1]
}
```

**Expected Response (422):**
```json
{
  "errors": [
    {
      "field": "activeStatuses",
      "receivedValue": [1, 1],
      "messageKey": "validation_error.array_duplicate_items"
    }
  ]
}
```

### Test Case 3: Valid input
**Input:**
```json
{
  "productCategoryName": "Điện thoại 123",
  "activeStatuses": [1, 0],
  "page": 1
}
```

**Expected Response (200):**
```json
{
  "message": "List productCategory is searched successfully",
  "data": { ... }
}
```

## Implementation Details

### http-exception.filter.ts

Filter tự động chuyển đổi validation errors sang format chuẩn:

```typescript
// Map constraint types to message keys
private mapConstraintToMessageKey(constraintType: string): string {
  const constraintMap: Record<string, string> = {
    isString: 'wrong_type_string',
    isInt: 'wrong_type_integer',
    isArray: 'wrong_type_array',
    arrayNoDuplicates: 'array_duplicate_items',
    // ...
  };
  return constraintMap[constraintType] || constraintType;
}
```

### Custom Validator Implementation

```typescript
@ValidatorConstraint({ name: 'arrayNoDuplicates', async: false })
export class ArrayNoDuplicatesConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!Array.isArray(value)) return true;
    const uniqueValues = new Set(value);
    return uniqueValues.size === value.length;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'array_duplicate_items';
  }
}
```

## Best Practices

1. **Use standard validators when possible**: Standard decorators (`@IsString()`, `@IsInt()`, etc.) are automatically mapped to custom message keys.

2. **Add custom validators for special cases**: Only create custom validators for business-specific validations (like `@ArrayNoDuplicates()`).

3. **Always include receivedValue**: This helps users understand what they sent incorrectly.

4. **Use consistent message key format**: All validation errors use `validation_error.<specific_error>` format.

5. **Order decorators correctly**:
   ```typescript
   @ValidateIf((o) => o.field !== undefined) // Conditional validation
   @IsNotIn([null]) // Reject null
   @Transform(transformFn) // Transform first
   @IsArray() // Type check
   @ArrayNotEmpty() // Content check
   @ArrayNoDuplicates() // Business rule
   @IsInt({ each: true }) // Element validation
   ```
