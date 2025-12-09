import { glob } from 'glob';
import path from 'path';
import { createTestDataSource } from './database.config';

/**
 * Cleanup test data for API tests
 *
 * Usage:
 *   npm run test:cleanup                           # Cleanup all APIs
 *   npm run test:cleanup get-list-product-category # Cleanup specific API
 */
async function main() {
  const apiName = process.argv[2]; // Get argument from command line

  if (apiName) {
    console.log(`🧹 Cleaning up data for: ${apiName}\n`);
  } else {
    console.log('🧹 Cleaning up data for ALL APIs\n');
  }

  const dataSource = await createTestDataSource();

  try {
    await dataSource.initialize();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  try {
    // Find seed files matching the pattern
    const pattern = apiName
      ? `src/tests/components/**/${apiName}.seed.ts`  // Cleanup specific API
      : `src/tests/components/**/*.seed.ts`;          // Cleanup all APIs

    const seedFiles = glob.sync(pattern);

    if (seedFiles.length === 0) {
      console.error(`❌ No seed file found for pattern: ${pattern}`);
      console.error(`   Make sure the seed file exists and matches the naming convention`);
      process.exit(1);
    }

    console.log(`Found ${seedFiles.length} seed file(s)\n`);

    // Cleanup in REVERSE order to avoid foreign key constraints
    for (let i = seedFiles.length - 1; i >= 0; i--) {
      const file = seedFiles[i];
      const fileName = path.basename(file, '.seed.ts');
      console.log(`  ▶ Cleaning up ${fileName}...`);

      const absolutePath = path.resolve(file);
      const module = await import(absolutePath);

      if (typeof module.cleanupAllTestData === 'function') {
        await module.cleanupAllTestData(dataSource);
        console.log(`  ✅ ${fileName} cleaned up successfully`);
      } else {
        console.warn(`  ⚠️  ${fileName}: No cleanupAllTestData() function found - skipping`);
      }
    }

    console.log('\n✅ All cleanup completed!');
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

main();
