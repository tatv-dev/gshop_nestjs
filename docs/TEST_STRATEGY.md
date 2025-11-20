# NestJS Test Strategy
## Domain-Driven Design + Hexagonal Architecture

This document defines the testing strategy for our NestJS application following DDD and Hexagonal Architecture principles.

---

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS 11+
- **Language:** TypeScript 5.7+
- **Testing Framework:** Jest 29+
- **Database:** MariaDB/MySQL
- **Test Database:** MariaDB (same as production)
- **ORM:** TypeORM 0.3+

---

## Architecture Overview

### Hexagonal Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│            Interface/Presentation Layer              │
│  (Controllers, DTOs, ValidationPipes, Guards)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              Application Layer                       │
│  (Query/Command Handlers, DTOs, Repository Ports)   │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                Domain Layer                          │
│  (Entities, Value Objects, Domain Services)          │
└──────────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│            Infrastructure Layer                      │
│  (Repository Adapters, External Service Adapters)   │
└──────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── components/
│   └── product-catalog/
│       ├── presentation/
│       │   ├── controllers/
│       │   └── requests/  (DTOs với class-validator)
│       ├── application/
│       │   ├── handlers/
│       │   ├── queries/
│       │   ├── dtos/
│       │   └── repositories/ (interfaces - ports)
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   └── exceptions/
│       └── infrastructure/
│           └── repositories/ (implementations - adapters)
└── shared/
    ├── domain/exceptions/
    ├── application/exceptions/
    └── infrastructure/exceptions/
```

---

## Test Strategy

### Test Types Matrix

| Layer | Component | Test Type | Test Location | Mock Strategy |
|-------|-----------|-----------|---------------|---------------|
| **Presentation** | Controller | E2E | `test/component/<bc>/<endpoint>/e2e/` | No mocks |
| **Presentation** | Request DTO | Unit | `test/component/<bc>/<endpoint>/unit/` | No mocks |
| **Application** | Query Handler | Unit | `test/component/<bc>/<endpoint>/unit/` | No mocks (call real repo) |
| **Application** | Query Handler | Integration | `test/component/<bc>/<endpoint>/integration/` | No mocks |
| **Application** | DTO | Unit | `test/component/<bc>/<endpoint>/unit/` | No mocks |
| **Domain** | Entity | Unit | `test/component/<bc>/domain/entity/` | No mocks |
| **Domain** | Value Object | Unit | `test/component/<bc>/domain/value-object/` | No mocks |
| **Infrastructure** | Repository | Integration | `test/component/<bc>/<endpoint>/integration/` | No mocks |

### 1. Unit Tests (UT)

**Scope:** FormRequest DTOs, Query Handlers, Entities, Value Objects

**Rules:**
- Test validation logic ONLY (not validator engine itself)
- For Query Handlers: Call REAL repository (no mocks)
- Test orchestration logic and data transformation
- MUST NOT use mocks for dependencies in Query Handlers
- Fast execution (< 100ms per test)

**Example:**
```typescript
// Request DTO Validation (Unit Test)
describe('GetListProductCategoryRequest - Unit Test', () => {
  it.each([
    {
      acId: 'AC-01',
      title: 'Valid tenant ID',
      input: { tenantId: 1, page: 1, size: 10 },
      expected: { valid: true }
    },
    {
      acId: 'AC-02',
      title: 'Missing tenant ID',
      input: { page: 1, size: 10 },
      expected: {
        valid: false,
        errors: [{ field: 'tenantId', message: 'tenantId is required' }]
      }
    }
  ])('[$acId] $title', async ({ input, expected }) => {
    const dto = plainToClass(GetListProductCategoryRequest, input);
    const errors = await validate(dto);

    if (expected.valid) {
      expect(errors).toHaveLength(0);
    } else {
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(expected.errors[0].field);
    }
  });
});
```

### 2. Integration Tests (IT)

**Scope:** Repository implementations, External Adapters

**Rules:**
- Test with REAL database
- NO mocks for database or repositories
- Seed data before EACH test
- Rollback transaction after EACH test
- Test actual queries and data persistence

**Example:**
```typescript
// Repository Integration Test
describe('ProductCategoryQueryRepository - Integration Test', () => {
  let repository: ProductCategoryQueryRepository;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    // Setup real database connection
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Seed data
    await seedTestData(queryRunner);

    repository = new ProductCategoryQueryRepository(queryRunner.manager.getRepository(ProductCategoryModel));
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it.each([
    {
      acId: 'AC-01',
      title: 'Find all categories for tenant',
      input: { tenantId: 1 },
      expected: { count: 3, firstCategoryName: 'Electronics' }
    }
  ])('[$acId] $title', async ({ input, expected }) => {
    const result = await repository.findAll(input.tenantId);

    expect(result).toHaveLength(expected.count);
    expect(result[0].getName()).toBe(expected.firstCategoryName);
  });
});
```

### 3. End-to-End Tests (E2E)

**Scope:** Full API endpoint flow from HTTP request to response

**Rules:**
- Test from HTTP layer to database
- NO mocks for ANY component
- Use real database
- Test complete request/response cycle
- Include authentication, authorization, validation

**Example:**
```typescript
// E2E Test
describe('GET /api/v1/product-catalog/product-categories - E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Setup full application
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Seed database
    await seedDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await app.close();
  });

  it.each([
    {
      acId: 'AC-01',
      title: 'Get list with valid tenant ID',
      input: { tenantId: 1, page: 1, size: 10 },
      headers: { Authorization: 'Bearer valid-token' },
      expected: { status: 200, dataLength: 3 }
    }
  ])('[$acId] $title', async ({ input, headers, expected }) => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/product-catalog/product-categories')
      .query(input)
      .set(headers)
      .expect(expected.status);

    expect(response.body.data).toHaveLength(expected.dataLength);
  });
});
```

---

## Test Organization Structure

### Per-Endpoint Organization

Each API endpoint has its own test directory containing all test types:

```
test/
└── component/
    └── product-catalog/
        ├── get-list-product-category/          # Endpoint-specific tests
        │   ├── unit/
        │   │   ├── request.spec.ts             # Request DTO validation
        │   │   ├── dto.spec.ts                 # Application DTO
        │   │   ├── query.spec.ts               # Query object
        │   │   └── handler.spec.ts             # Handler logic (no mocks)
        │   ├── integration/
        │   │   ├── handler.spec.ts             # Handler with real DB
        │   │   └── repository.spec.ts          # Repository with real DB
        │   └── e2e/
        │       └── api.spec.ts                 # Full HTTP flow
        │
        ├── domain/                             # Shared domain tests
        │   ├── entity/
        │   │   └── product-category.spec.ts
        │   └── value-object/
        │       └── product-category-name.spec.ts
        │
        └── test-helpers/                       # Shared test utilities
            ├── seed-data.ts
            ├── factories.ts
            └── assertions.ts
```

---

## Data Provider Pattern (Jest)

### Using `test.each()` for Table-Driven Tests

Jest equivalent of PHPUnit's DataProvider:

```typescript
describe('GetListProductCategoryRequest Validation', () => {
  it.each([
    // Happy path - ALWAYS FIRST
    {
      acId: 'AC-01',
      title: 'Valid request with all fields',
      input: {
        tenantId: 1,
        productCategoryName: 'Electronics',
        activeStatuses: [1],
        page: 1,
        size: 10
      },
      expected: {
        valid: true
      }
    },
    // Validation errors
    {
      acId: 'AC-02',
      title: 'Missing required field tenantId',
      input: {
        page: 1,
        size: 10
      },
      expected: {
        valid: false,
        errors: [
          { field: 'tenantId', constraint: 'isNotEmpty' }
        ]
      }
    },
    {
      acId: 'AC-03',
      title: 'Invalid tenantId type (string instead of number)',
      input: {
        tenantId: 'invalid',
        page: 1,
        size: 10
      },
      expected: {
        valid: false,
        errors: [
          { field: 'tenantId', constraint: 'isInt' }
        ]
      }
    },
    // Boundary values
    {
      acId: 'AC-04',
      title: 'Page number at maximum (1000)',
      input: {
        tenantId: 1,
        page: 1000,
        size: 10
      },
      expected: {
        valid: true
      }
    },
    {
      acId: 'AC-05',
      title: 'Page number exceeds maximum (1001)',
      input: {
        tenantId: 1,
        page: 1001,
        size: 10
      },
      expected: {
        valid: false,
        errors: [
          { field: 'page', constraint: 'max' }
        ]
      }
    }
  ])('[$acId] $title', async ({ input, expected }) => {
    // Arrange
    const dto = plainToClass(GetListProductCategoryRequest, input);

    // Act
    const errors = await validate(dto);

    // Assert
    if (expected.valid) {
      expect(errors).toHaveLength(0);
    } else {
      expect(errors.length).toBeGreaterThan(0);
      expected.errors.forEach(expectedError => {
        const error = errors.find(e => e.property === expectedError.field);
        expect(error).toBeDefined();
        expect(error.constraints).toHaveProperty(expectedError.constraint);
      });
    }
  });
});
```

---

## Seed Data Strategy

### Principles

1. **Real Database:** Integration tests MUST use real database
2. **Foreign Key Constraints:** Seed data MUST respect FK constraints
3. **Independent Tests:** Each test case has independent data setup
4. **Minimal but Complete:** Seed minimum data required for test to pass
5. **Cleanup:** Rollback transaction or truncate after each test
6. **Idempotent:** Can run multiple times without errors
7. **Topological Order:** Insert parent tables before child tables

### Seed Data Process

```typescript
// test/component/product-catalog/test-helpers/seed-data.ts

export async function seedTestData(queryRunner: QueryRunner) {
  // Step 1: Clear existing data (in reverse dependency order)
  await queryRunner.query('DELETE FROM product_categories');
  await queryRunner.query('DELETE FROM tenants');

  // Step 2: Seed in dependency order (parents first)
  // Seed tenants (parent table)
  await queryRunner.query(`
    INSERT INTO tenants (id, name, active_status, created_at, updated_at)
    VALUES
      (1, 'ICAR', 1, NOW(), NOW()),
      (2, 'Test Tenant', 1, NOW(), NOW())
  `);

  // Seed product_categories (child table)
  await queryRunner.query(`
    INSERT INTO product_categories (
      id, name, tenant_id, product_category_parent_id,
      level, parent_level1_id, parent_level2_id,
      active_status, creator_id, created_at, updated_at
    )
    VALUES
      (1, 'Electronics', 1, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),
      (2, 'Food', 1, NULL, 1, NULL, NULL, 1, 1, NOW(), NOW()),
      (3, 'Computers', 1, 1, 2, 1, NULL, 1, 1, NOW(), NOW())
  `);
}

export async function cleanupTestData(queryRunner: QueryRunner) {
  // Cleanup in reverse dependency order
  await queryRunner.query('DELETE FROM product_categories');
  await queryRunner.query('DELETE FROM tenants');
}
```

### Handling Large Data

For arrays > 500 elements, strings > 1000 chars, numbers > 1000000:

```typescript
// Generate data with factory functions
export function generateLargeProductCategoryName(): string {
  return 'A'.repeat(255); // Max length boundary test
}

export function generateManyCategories(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
    tenantId: 1,
    level: 1,
    activeStatus: 1,
    creatorId: 1
  }));
}
```

---

## Exception Handling Strategy

### Exception Hierarchy

```
Exception (base)
├── DomainException (400) - Business rule violations
├── ApplicationException (400) - Use case failures
├── InfrastructureException (500) - Technical failures
└── ValidationException (422) - Input validation errors
```

### Layer Responsibilities

| Layer | Throws | Catches | Test Focus |
|-------|--------|---------|------------|
| **Presentation** | ValidationException | ApplicationException, DomainException → HTTP Response | Assert validation errors |
| **Application** | ApplicationException | InfrastructureException → wrap in ApplicationException | Assert exception type & message |
| **Domain** | DomainException | Nothing | Assert business rule enforcement |
| **Infrastructure** | InfrastructureException | DB/API errors → wrap in InfrastructureException | Happy path only in IT |

### Test Assertions

```typescript
// Request DTO validation error
it('should fail validation for missing tenantId', async () => {
  const dto = plainToClass(GetListProductCategoryRequest, {});
  const errors = await validate(dto);

  expect(errors.length).toBeGreaterThan(0);
  const tenantIdError = errors.find(e => e.property === 'tenantId');
  expect(tenantIdError).toBeDefined();
  expect(tenantIdError.constraints).toHaveProperty('isNotEmpty');
});

// Handler throws ApplicationException
it('should throw ApplicationException for invalid tenant', async () => {
  await expect(handler.execute(dto))
    .rejects
    .toThrow(ApplicationException);
});

// Domain entity throws DomainException
it('should throw DomainException for invalid business rule', () => {
  expect(() => new ProductCategory(/* invalid params */))
    .toThrow(DomainException);
});
```

---

## Quality Checklist

### Before Generation

- [ ] Read test plan + DB schema + standard knowledge
- [ ] Identify layer, type (UT/IT/E2E), test class
- [ ] Analyze dependency graph for seeding data

### Syntax

- [ ] TypeScript 5.7+ syntax valid
- [ ] Proper imports and module resolution
- [ ] Type hints for params and return types
- [ ] Jest test structure valid

### Structure

- [ ] Correct test file location per endpoint
- [ ] Using `test.each()` for data-driven tests
- [ ] Test methods use `it()` or `test()`
- [ ] Follow Arrange-Act-Assert pattern

### Data Provider

- [ ] Happy path is FIRST test case
- [ ] Each case has acId, title, input, expected
- [ ] Key format: `{acId: 'AC-XX', title: '...'}`
- [ ] Use factory functions for large data

### Assertions

- [ ] All assertions include AC ID in message
- [ ] Request DTO: Assert validation errors, not exact messages
- [ ] Repository IT: Assert empty result, not exceptions
- [ ] No assertions on exact error messages (can change between versions)

### Seeding

- [ ] Seed data respects FK dependencies
- [ ] Seed in beforeEach() or test method
- [ ] Minimum data required for test to pass
- [ ] Clear cleanup strategy (rollback transaction)

### RED CODE Principles

- [ ] Test FAILS because implementation missing
- [ ] No placeholder comments (TODO/FIXME)
- [ ] No hardcoded timestamps unless needed
- [ ] Code compiles, only fails on missing implementation

---

## NestJS Testing Utilities

### Module Testing Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';

let module: TestingModule;
let handler: GetListProductCategoryQueryHandler;
let repository: IProductCategoryQueryRepository;

beforeEach(async () => {
  module = await Test.createTestingModule({
    providers: [
      GetListProductCategoryQueryHandler,
      {
        provide: 'IProductCategoryQueryRepository',
        useClass: ProductCategoryQueryRepository, // Real implementation, not mock!
      },
    ],
  }).compile();

  handler = module.get<GetListProductCategoryQueryHandler>(GetListProductCategoryQueryHandler);
  repository = module.get<IProductCategoryQueryRepository>('IProductCategoryQueryRepository');
});
```

### Database Setup for Integration Tests

```typescript
import { DataSource, QueryRunner } from 'typeorm';

let dataSource: DataSource;
let queryRunner: QueryRunner;

beforeAll(async () => {
  dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE_TEST || 'gshop_test',
    entities: [ProductCategoryModel],
    synchronize: false, // Use migrations
  });

  await dataSource.initialize();
});

beforeEach(async () => {
  queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  // Seed data here
});

afterEach(async () => {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
});

afterAll(async () => {
  await dataSource.destroy();
});
```

---

## Naming Conventions

### Test Files

| Component | Test Type | File Name Pattern | Example |
|-----------|-----------|-------------------|---------|
| Request DTO | Unit | `{action}-{domain}.request.spec.ts` | `get-list-product-category.request.spec.ts` |
| Application DTO | Unit | `{action}-{domain}.dto.spec.ts` | `get-list-product-category.dto.spec.ts` |
| Query Object | Unit | `{action}-{domain}.query.spec.ts` | `get-list-product-category.query.spec.ts` |
| Query Handler | Unit | `{action}-{domain}.handler.unit.spec.ts` | `get-list-product-category.handler.unit.spec.ts` |
| Query Handler | Integration | `{action}-{domain}.handler.integration.spec.ts` | `get-list-product-category.handler.integration.spec.ts` |
| Repository | Integration | `{domain}-query.repository.spec.ts` | `product-category-query.repository.spec.ts` |
| Controller | E2E | `{endpoint}.e2e.spec.ts` | `get-list-product-category.e2e.spec.ts` |
| Entity | Unit | `{entity}.entity.spec.ts` | `product-category.entity.spec.ts` |
| Value Object | Unit | `{vo}.vo.spec.ts` | `product-category-name.vo.spec.ts` |

### Test Suite Names

```typescript
// Use descriptive names with layer context
describe('GetListProductCategoryRequest - Unit Test', () => {});
describe('GetListProductCategoryQueryHandler - Unit Test', () => {});
describe('ProductCategoryQueryRepository - Integration Test', () => {});
describe('GET /api/v1/product-catalog/product-categories - E2E Test', () => {});
```

---

## Example: Complete Test Suite

See `test/component/product-catalog/get-list-product-category/` for a complete example implementing all test types for a single endpoint.

---

## References

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeORM Testing](https://typeorm.io/testing)
- [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807)
