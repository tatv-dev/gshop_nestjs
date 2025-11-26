# Error Handling System

Hệ thống xử lý lỗi toàn diện với custom exception classes và field-level validation errors.

## Exception Classes

### 1. ApplicationErrorException
**HTTP Status**: 400 Bad Request
**Use cases**: Missing parameters, invalid application state

```typescript
import { ApplicationErrorException } from '@/shared/application/exceptions/application-error.exception';

throw new ApplicationErrorException('missing_parameter', {
  parameter: 'productId'
});
```

**Response:**
```json
{
  "messageKey": "application_error.missing_parameter",
  "title": "Thiếu tham số bắt buộc",
  "detail": "Tham số productId là bắt buộc và không được để trống.",
  "status": 400,
  "instance": "GET /api/v1/products",
  "timestamp": "2025-11-26T10:00:00Z"
}
```

### 2. AuthErrorException
**HTTP Status**: 401 Unauthorized / 403 Forbidden
**Use cases**: Authentication, authorization errors

```typescript
import { AuthErrorException } from '@/shared/application/exceptions/auth-error.exception';

// Token expired (401)
throw new AuthErrorException('auth_token_expired', {
  expiredAt: '2025-11-26T10:00:00+07:00'
});

// Permission denied (403)
throw new AuthErrorException('forbidden', {
  permission: 'CREATE_PRODUCT'
});
```

**Available message keys:**
- `authentication_required` (401)
- `auth_token_expired` (401)
- `auth_invalid_credentials` (401)
- `forbidden` (403)
- `account_locked` (403)

### 3. BusinessErrorException
**HTTP Status**: 404 Not Found / 409 Conflict / 410 Gone
**Use cases**: Business logic violations, resource conflicts

```typescript
import { BusinessErrorException } from '@/shared/application/exceptions/business-error.exception';

// Resource not found (404)
throw new BusinessErrorException('resource_not_found', {
  resourceType: 'Product',
  resourceId: '123'
});

// Resource conflict (409)
throw new BusinessErrorException('resource_conflict', {
  resource: 'Product',
  value: 'SKU-123'
});

// State conflict (409)
throw new BusinessErrorException('state_conflict', {
  action: 'cancel order',
  status: 'delivered'
});
```

**Available message keys:**
- `resource_not_found` (404)
- `resource_conflict` (409)
- `state_conflict` (409)
- `resource_gone` (410)

### 4. SystemErrorException
**HTTP Status**: Various 4xx/5xx
**Use cases**: System-level errors, infrastructure issues

```typescript
import { SystemErrorException } from '@/shared/application/exceptions/system-error.exception';

// Rate limit exceeded (429)
throw new SystemErrorException('rate_limit_exceeded', {
  retryAfter: '60'
});

// Internal server error (500)
throw new SystemErrorException('internal_error', {
  errorId: 'ERR-12345'
});

// Service unavailable (503)
throw new SystemErrorException('service_unavailable');
```

**Available message keys:**
- `bad_request` (400)
- `endpoint_not_found` (404)
- `method_not_allowed` (405)
- `not_acceptable` (406)
- `rate_limit_exceeded` (429)
- `internal_error` (500)
- `database_connection_error` (503)
- `not_implemented` (501)
- `service_unavailable` (503)
- `third_party_error` (502)
- `payload_too_large` (413)

## Validation Errors

ValidationPipe automatically formats validation errors with field-level details.

### Simple Field Validation

**Request:**
```
GET /api/v1/products?page="abc"
```

**Response (422):**
```json
{
  "messageKey": "validation_error",
  "title": "Lỗi xác thực dữ liệu",
  "detail": "Dữ liệu đầu vào không hợp lệ.",
  "status": 422,
  "instance": "GET /api/v1/products?page=%22abc%22",
  "timestamp": "2025-11-26T10:00:00Z",
  "errors": [
    {
      "field": "page",
      "receivedValue": "abc",
      "messageKey": "validation_error.wrong_type_integer"
    }
  ]
}
```

### Nested Array Validation

**Request:**
```
GET /api/v1/products?categoryIds=[1,"+"]
```

**Response (422):**
```json
{
  "messageKey": "validation_error",
  "title": "Lỗi xác thực dữ liệu",
  "status": 422,
  "errors": [
    {
      "field": "categoryIds[1]",
      "receivedValue": "+",
      "messageKey": "validation_error.wrong_type_integer"
    }
  ]
}
```

### Array Duplicate Items

**Request:**
```
GET /api/v1/products?statuses=[1,1]
```

**Response (422):**
```json
{
  "errors": [
    {
      "field": "statuses",
      "receivedValue": [1, 1],
      "messageKey": "validation_error.array_duplicate_items"
    }
  ]
}
```

## Validation Message Keys

All validation errors use `validation_error.<specific_error>` format:

| Message Key | Description |
|-------------|-------------|
| `missing` | Required field missing |
| `null` | Field must not be null |
| `out_of_set` | Value not in allowed set |
| `wrong_type_string` | Must be string |
| `wrong_type_integer` | Must be integer |
| `wrong_type_number` | Must be number |
| `wrong_type_boolean` | Must be boolean |
| `wrong_type_array` | Must be array |
| `wrong_type_object` | Must be object |
| `array_empty` | Array must not be empty |
| `array_duplicate_items` | Array must have unique items |
| `invalid_email` | Invalid email format |
| `invalid_phone` | Invalid phone number |
| `invalid_url` | Invalid URL format |
| `min_value` | Value too small |
| `max_value` | Value too large |
| `min_length` | String too short |
| `max_length` | String too long |

## Usage in Controllers

### Example 1: Business Error

```typescript
@Controller('api/v1/products')
export class ProductController {
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.findById(id);

    if (!product) {
      throw new BusinessErrorException('resource_not_found', {
        resourceType: 'Product',
        resourceId: id,
      });
    }

    return product;
  }
}
```

### Example 2: Auth Error

```typescript
@UseGuards(JwtAuthGuard)
@Controller('api/v1/products')
export class ProductController {
  @Post()
  @RequirePermissions('CREATE_PRODUCT')
  async createProduct(@Body() dto: CreateProductRequest) {
    // If user doesn't have permission, PermissionGuard will throw:
    // throw new AuthErrorException('forbidden', {
    //   permission: 'CREATE_PRODUCT'
    // });

    return await this.productService.create(dto);
  }
}
```

### Example 3: Application Error

```typescript
@Post('bulk-update')
async bulkUpdate(@Body() dto: BulkUpdateRequest) {
  if (!dto.ids || dto.ids.length === 0) {
    throw new ApplicationErrorException('missing_parameter', {
      parameter: 'ids'
    });
  }

  return await this.productService.bulkUpdate(dto.ids, dto.data);
}
```

## Success Responses

Success responses also use consistent message keys:

```typescript
{
  "messageKey": "success.query",
  "message": "Lấy dữ liệu thành công",
  "data": { ... }
}
```

**Available success keys:**
- `query` - Data retrieved successfully
- `stored` - Created successfully
- `updated` - Updated successfully
- `deleted` - Deleted successfully
- `restored` - Restored successfully
- `login_success` - Login successful
- `logout_success` - Logout successful
- `uploaded` - File uploaded
- `sent_sms` - SMS sent
- `sent_mail` - Email sent

## Best Practices

1. **Use specific exception types**: Don't use generic HttpException
2. **Include context params**: Always provide params for message interpolation
3. **Validate at boundary**: Use ValidationPipe for input validation
4. **Business logic errors**: Use BusinessErrorException for domain violations
5. **System errors**: Use SystemErrorException for infrastructure issues
6. **Consistent message keys**: Follow the established naming convention

## Testing

```typescript
describe('ProductController', () => {
  it('should throw BusinessErrorException when product not found', async () => {
    // Arrange
    jest.spyOn(productService, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(controller.getProduct('999')).rejects.toThrow(
      BusinessErrorException
    );
  });
});
```
