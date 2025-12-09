# How to Apply PROMPT_RED_CODE Updates

This guide explains how to apply the command-based seeding updates to PROMPT_RED_CODE.yaml.

## 📋 Overview

The updates introduce a new **command-based seeding approach** where:
- Tests do NOT seed data themselves
- Seeding is done via: `npm run test:seed <api-name>`
- Cleanup is done via: `npm run test:cleanup <api-name>`
- Tests assume data is pre-seeded

## 🔧 Changes Required

### 1. Update `step_4_generate_seed_data` (around line 149)

**Replace the entire section with:**
- New description mentioning "COMMAND-BASED seeding strategy"
- Instructions to generate `seedAllTestData()` and `cleanupAllTestData()`
- Remove references to `beforeAll/beforeEach` seeding in tests

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `step_4_generate_seed_data`

### 2. Update `code_templates.seed_data_helper_template` (around line 2118)

**Replace entire template with:**
- New file structure with 4 sections:
  1. Constants
  2. Main functions (`seedAllTestData`, `cleanupAllTestData`)
  3. Helper functions
  4. Legacy functions (optional)

**Key changes:**
- `seedTestData()` → `seedAllTestData()` (main function)
- `cleanup()` → `cleanupAllTestData()` (targeted cleanup)
- Keep legacy functions for backward compatibility

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `code_templates.seed_data_helper_template`

### 3. Update `code_templates.e2e_test_template` (around line 1792)

**Changes:**
- Remove `cleanup`, `seedProductCategoriesTestData`, `seedTestData` imports
- Remove `dataSource`, `queryRunner` variables
- Remove `seedTestData()` call from `beforeAll`
- Remove `beforeEach` and `afterEach` hooks completely
- Add comment: `// ⚠️ IMPORTANT: Data must be seeded before running tests`
- Add comment: `// Run: npm run test:seed <action-domain>`
- Change `afterAll`: Remove cleanup call, add comment about external cleanup

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `code_templates.e2e_test_template`

### 4. Update `code_templates.handler_it_template` (around line 1900)

**Changes:**
- Remove seed-related imports
- Remove `beforeEach` and `afterEach` hooks
- Add comment about pre-seeded data
- Simplify `beforeAll` - only setup module
- Simplify `afterAll` - only close module

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `code_templates.handler_it_template`

### 5. Update `code_templates.repository_it_template` (around line 1950)

**Changes:**
- Same as Handler IT template
- Remove seed/cleanup logic
- Add comments about external seeding

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `code_templates.repository_it_template`

### 6. Add new section `standard_knowledge.test_workflow`

**Add new section** explaining:
- Command-based workflow steps
- Benefits of new approach
- Important notes about data sharing

**See:** `PROMPT_RED_CODE_UPDATES.yaml` → `standard_knowledge.test_workflow`

## 📝 Manual Update Steps

### Step 1: Backup current file
```bash
cp docs/PROMPT_RED_CODE.yaml docs/PROMPT_RED_CODE.yaml.backup
```

### Step 2: Update step_4_generate_seed_data

Find line ~149 and replace the `step_4_generate_seed_data` section with content from `PROMPT_RED_CODE_UPDATES.yaml`.

### Step 3: Update code_templates.seed_data_helper_template

Find line ~2118 and replace the `seed_data_helper_template` section.

### Step 4: Update E2E template

Find line ~1792 (`e2e_test_template`) and replace with updated version.

### Step 5: Update Handler IT template

Find the `handler_it_template` section and replace it.

### Step 6: Update Repository IT template

Find the `repository_it_template` section and replace it.

### Step 7: Add test workflow section

Add the new `test_workflow` section under `standard_knowledge`.

### Step 8: Update references

Search for and update any other references to:
- `seedTestData` → should mention `seedAllTestData`
- `cleanup` → should mention `cleanupAllTestData`
- TWO-TIER seeding → should mention COMMAND-BASED seeding

## ✅ Verification

After applying updates, verify:

1. **Seed template** includes:
   - `seedAllTestData()` function
   - `cleanupAllTestData()` function
   - Proper comments about npm commands

2. **E2E template** includes:
   - Comment about running `npm run test:seed` first
   - NO seed calls in `beforeAll`
   - NO `beforeEach`/`afterEach` hooks
   - Comment in `afterAll` about external cleanup

3. **IT templates** include:
   - Same pattern as E2E (no internal seeding)
   - Comments about pre-seeded data

4. **Workflow documentation** explains:
   - How to use npm commands
   - Benefits of new approach

## 🎯 Testing

Generate a new test file using updated PROMPT_RED_CODE.yaml and verify:
- Seed file has `seedAllTestData()` and `cleanupAllTestData()`
- Test files have comments about external seeding
- No seed logic in test files themselves

## 📚 References

- **Implementation:** `src/tests/setup/` directory
- **Example:** `src/tests/components/product-catalog/get-list-product-category/`
- **Documentation:** `src/tests/setup/README.md`
- **Updates:** `docs/PROMPT_RED_CODE_UPDATES.yaml`
