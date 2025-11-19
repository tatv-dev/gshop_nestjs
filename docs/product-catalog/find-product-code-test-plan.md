# Test Plan: Find Product by Code API

## Feature Overview
**API Endpoint**: `GET /api/v2/product-catalog/find-product-code`
**Bounded Context**: ProductCatalog
**Use Case**: Tìm kiếm sản phẩm theo mã code

## Business Logic

### Given (Input)
- `productCode` (required, string): Mã sản phẩm cần tìm
  - Validation: không được rỗng, độ dài 1-50 ký tự
  - Format: chữ, số, dấu gạch ngang, gạch dưới
  - Case-sensitive search
- `tenantId` (from JWT token): ID của tenant
- Security: User phải được authenticate

### When (Trigger)
- Người dùng gọi API với productCode hợp lệ

### Then (Expected Behavior)
- Tìm kiếm product theo productCode (exact match)
- Filter theo tenantId (multi-tenant isolation)
- Nếu tìm thấy: trả về product info với status 200
- Nếu không tìm thấy: trả về error 404 NOT_FOUND
- Response format: RFC 7807 compliant

### Return (Output Structure)
```typescript
// Success Response (200)
{
  "success": true,
  "data": {
    "productId": number,
    "productCode": string,
    "productName": string,
    "description": string,
    "price": number,
    "unit": string,
    "categoryId": number,
    "categoryName": string,
    "activeStatus": number,
    "createdAt": string (ISO 8601),
    "updatedAt": string (ISO 8601)
  },
  "timestamp": string (ISO 8601)
}

// Error Response (404)
{
  "success": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "timestamp": string (ISO 8601),
  "path": "/api/v2/product-catalog/find-product-code",
  "method": "GET"
}
```

## Test Cases

### Unit Tests - Domain Layer

#### AC_DOMAIN_01: ProductCode Value Object
**Layer**: Domain
**Type**: Unit Test
**Test Class**: `ProductCodeVO.spec.ts`

**Test Cases**:
1. [PASS] Tạo ProductCode hợp lệ với code "PROD-001"
2. [FAIL] Tạo ProductCode với empty string → throw DomainError
3. [FAIL] Tạo ProductCode với string > 50 chars → throw DomainError
4. [FAIL] Tạo ProductCode với ký tự đặc biệt không hợp lệ → throw DomainError
5. [PASS] Equals method so sánh 2 ProductCode giống nhau
6. [FAIL] Equals method so sánh 2 ProductCode khác nhau

### Unit Tests - Application Layer

#### AC_APP_01: FindProductByCodeDTO Validation
**Layer**: Application
**Type**: Unit Test
**Test Class**: `FindProductByCodeDTO.spec.ts`

**Test Cases**:
1. [PASS] Tạo DTO với productCode và tenantId hợp lệ
2. [FAIL] Tạo DTO với productCode empty
3. [FAIL] Tạo DTO với tenantId <= 0

#### AC_APP_02: FindProductByCodeQueryHandler Logic
**Layer**: Application
**Type**: Unit Test
**Test Class**: `FindProductByCodeQueryHandler.spec.ts`

**Test Cases**:
1. [PASS] Handler gọi repository.findByCode với đúng params
2. [PASS] Handler trả về product khi tìm thấy
3. [PASS] Handler throw NotFoundException khi không tìm thấy
4. [PASS] Handler throw error khi repository throw InfrastructureException

### Integration Tests - Infrastructure Layer

#### AC_INFRA_01: ProductQueryRepository.findByCode
**Layer**: Infrastructure
**Type**: Integration Test
**Test Class**: `ProductQueryRepository.spec.ts`

**Seed Data**:
```typescript
// Tenants
{ id: 1, name: "Test Tenant", status: 1 }

// Product Categories
{ id: 1, name: "Electronics", tenantId: 1 }

// Products
{ id: 1, productCode: "PROD-001", name: "Product 1", categoryId: 1, tenantId: 1, activeStatus: 1 }
{ id: 2, productCode: "PROD-002", name: "Product 2", categoryId: 1, tenantId: 1, activeStatus: 0 }
{ id: 3, productCode: "PROD-003", name: "Product 3", categoryId: 1, tenantId: 2, activeStatus: 1 }
```

**Test Cases**:
1. [PASS] AC_INFRA_01_01: Tìm thấy product với code "PROD-001" và tenantId 1
2. [PASS] AC_INFRA_01_02: Tìm thấy product inactive (activeStatus=0)
3. [PASS] AC_INFRA_01_03: Không tìm thấy với tenantId sai (isolation)
4. [PASS] AC_INFRA_01_04: Không tìm thấy với code không tồn tại → return null
5. [PASS] AC_INFRA_01_05: Search case-sensitive ("prod-001" != "PROD-001")

### Unit Tests - Presentation Layer

#### AC_PRES_01: FindProductByCodeRequest Validation
**Layer**: Presentation
**Type**: Unit Test
**Test Class**: `FindProductByCodeRequest.spec.ts`

**Test Cases**:
1. [PASS] Validation pass với productCode hợp lệ
2. [FAIL] Validation fail với productCode empty → error "productCode should not be empty"
3. [FAIL] Validation fail với productCode > 50 chars → error "productCode must be shorter than or equal to 50 characters"
4. [FAIL] Validation fail với productCode có ký tự đặc biệt → error "productCode must match pattern"

#### AC_PRES_02: ProductCatalogController.findByCode
**Layer**: Presentation
**Type**: Unit Test
**Test Class**: `ProductCatalogController.spec.ts`

**Test Cases**:
1. [PASS] Controller map request thành Query và gọi QueryBus
2. [PASS] Controller trả về 200 với product data
3. [PASS] Controller trả về 404 khi product không tồn tại
4. [PASS] Controller trích xuất tenantId từ JWT token

### E2E Tests

#### AC_E2E_01: Find Product by Code - Full Flow
**Type**: E2E Test
**Test Class**: `FindProductByCode.e2e-spec.ts`

**Test Cases**:
1. [PASS] AC_E2E_01: GET /find-product-code?productCode=PROD-001 với JWT hợp lệ → 200 OK
2. [FAIL] AC_E2E_02: GET /find-product-code?productCode=INVALID → 404 NOT_FOUND
3. [FAIL] AC_E2E_03: GET /find-product-code?productCode= (empty) → 400 BAD_REQUEST
4. [FAIL] AC_E2E_04: GET /find-product-code (missing productCode) → 400 BAD_REQUEST
5. [FAIL] AC_E2E_05: GET /find-product-code?productCode=PROD-001 không có JWT → 401 UNAUTHORIZED
6. [FAIL] AC_E2E_06: GET /find-product-code?productCode=PROD-003 với tenantId khác → 404 (tenant isolation)

## Database Schema (MariaDB)

```sql
-- Tenants table (shared)
CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  status INT NOT NULL DEFAULT 1,
  remaining_account_quota INT NOT NULL DEFAULT 0,
  total_account_quota INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  active_status INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT FK_tenants_TO_product_categories FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_code VARCHAR(50) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  category_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  active_status INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY UK_product_code_tenant (product_code, tenant_id),
  KEY IDX_product_code (product_code),
  KEY IDX_tenant_id (tenant_id),
  CONSTRAINT FK_tenants_TO_products FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT FK_categories_TO_products FOREIGN KEY (category_id) REFERENCES product_categories(id)
);
```

## Implementation Order (TDD)

### Phase 1: RED CODE (Tests First)
1. Domain Layer Tests
2. Application Layer Tests
3. Infrastructure Layer Tests
4. Presentation Layer Tests
5. E2E Tests

### Phase 2: GREEN CODE (Implementation)
1. Domain Layer (Value Objects, Entities, Repository Interfaces)
2. Application Layer (DTOs, Queries, Handlers)
3. Infrastructure Layer (TypeORM Models, Repositories)
4. Presentation Layer (Controllers, Request/Response DTOs)
5. Module Registration

### Phase 3: VERIFICATION
1. Run all unit tests
2. Run integration tests
3. Run E2E tests
4. Check code coverage (target: >= 80%)
5. Code quality check

## Placeholders Mapping

```yaml
Entity: "Product"
entity: "product"
entity_table: "products"
entity_id_field: "productId"

Action: "FindByCode"
action: "findByCode"
FeatureName: "FindProductByCode"

field1: "productCode"
field2: "productName"
searchField: "productCode"
statusField: "activeStatus"

BoundedContext: "ProductCatalog"
BC: "ProductCatalog"

sampleValue1: "PROD-001"
sampleValue2: "PROD-002"
sampleId: 1
```
