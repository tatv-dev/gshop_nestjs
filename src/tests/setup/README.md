# Test Data Seeding & Cleanup

This directory contains scripts for managing test data lifecycle.

## 📋 Overview

Each API test has its own seed file (e.g., `get-list-product-category.seed.ts`) that defines:
- `seedAllTestData()` - Seeds all required data for the API
- `cleanupAllTestData()` - Cleans up all data for the API

## 🚀 Usage

### Seed data for a specific API

```bash
npm run test:seed get-list-product-category
```

### Run tests for a specific API

```bash
npm run test:redcode get-list-product-category
```

### Cleanup data for a specific API

```bash
npm run test:cleanup get-list-product-category
```

### Full workflow (Seed → Test → Cleanup)

```bash
# For a specific API
npm run test:seed get-list-product-category && \
npm run test:redcode get-list-product-category && \
npm run test:cleanup get-list-product-category

# Or use the full command (runs all APIs)
npm run test:full
```

### Seed/Test/Cleanup ALL APIs

```bash
# Seed all APIs
npm run test:seed

# Run all tests
npm run test:redcode

# Cleanup all APIs
npm run test:cleanup
```

## 📂 File Structure

```
src/tests/
├── setup/
│   ├── seed.ts              # Seed script (accepts API name parameter)
│   ├── cleanup.ts           # Cleanup script (accepts API name parameter)
│   ├── database.config.ts   # Database connection configuration
│   └── README.md            # This file
└── components/
    └── product-catalog/
        └── get-list-product-category/
            ├── get-list-product-category.seed.ts      # Seed functions for this API
            └── get-list-product-category.e2e.spec.ts  # Test file (no seed logic)
```

## 📝 Adding a New API Test

1. Create a seed file: `<api-name>.seed.ts`

```typescript
import { DataSource } from 'typeorm';

// Export test data for this API
export async function seedAllTestData(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Seed base data (users, tenants, etc.)
    // Seed API-specific data
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function cleanupAllTestData(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Delete data in reverse order (avoid FK constraints)
    await queryRunner.query('DELETE FROM ...');
  } finally {
    await queryRunner.release();
  }
}
```

2. Create test file: `<api-name>.e2e.spec.ts`

```typescript
describe('My API E2E', () => {
  beforeAll(async () => {
    // ⚠️ Data must be seeded via: npm run test:seed <api-name>
    // Only setup app and login here
  });

  afterAll(async () => {
    // ⚠️ Data cleanup via: npm run test:cleanup <api-name>
  });

  it('should work', async () => {
    // Test logic using pre-seeded data
  });
});
```

3. Run the workflow:

```bash
npm run test:seed <api-name>
npm run test:redcode <api-name>
npm run test:cleanup <api-name>
```

## ⚠️ Important Notes

### Test Isolation

With this approach, **tests share data**:
- ❌ Test A modifying data may affect Test B
- ❌ Cannot run parallel tests safely
- ⚠️ Tests should primarily **READ** data, minimize **WRITE** operations

If a test modifies data and fails:
```bash
# Re-seed to restore clean state
npm run test:cleanup <api-name>
npm run test:seed <api-name>
```

### Naming Convention

Seed files **MUST** match the API name:
- ✅ `get-list-product-category.seed.ts`
- ✅ `create-product.seed.ts`
- ❌ `product.seed.ts` (won't be found by pattern matching)

### Database Configuration

**Create a `.env` file in the root directory:**

```bash
# Copy from example
cp .env.example .env

# Or create manually:
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=gshop_test
EOF
```

Environment variables used:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USERNAME` (default: root)
- `DB_PASSWORD` (default: empty)
- `DB_DATABASE` (default: test_db)

**Note:** The scripts automatically load `.env` file using `dotenv/config`.

## 🔧 Troubleshooting

### "No seed file found"

Check that:
1. File exists in the correct location
2. File name matches the pattern: `<api-name>.seed.ts`
3. You're passing the correct API name

### "No seedAllTestData() function found"

Ensure your seed file exports:
- `export async function seedAllTestData(dataSource: DataSource)`
- `export async function cleanupAllTestData(dataSource: DataSource)`

### Database connection errors

Check:
1. Database is running
2. Environment variables are set correctly
3. Database credentials are valid
