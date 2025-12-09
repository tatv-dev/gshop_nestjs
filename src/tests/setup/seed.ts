import { glob } from 'glob';
import path from 'path';
import { createTestDataSource } from './database.config';

/**
 * Seed test data for API tests
 *
 * Usage:
 *   npm run test:seed                           # Seed all APIs
 *   npm run test:seed get-list-product-category # Seed specific API
 */
async function main() {
  const apiName = process.argv[2]; // Get argument from command line

  if (apiName) {
    console.log(`🌱 Seeding data for: ${apiName}\n`);
  } else {
    console.log('🌱 Seeding data for ALL APIs\n');
  }

  // Verify .env is loaded
  console.log('📋 Database config:');
  console.log(`   Host: ${process.env.DB_HOST || 'NOT SET'}`);
  console.log(`   Port: ${process.env.DB_PORT || 'NOT SET'}`);
  console.log(`   Database: ${process.env.DB_DATABASE || 'NOT SET'}`);
  console.log(`   Username: ${process.env.DB_USERNAME || 'NOT SET'}\n`);

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
      ? `src/tests/components/**/${apiName}.seed.ts`  // Seed specific API
      : `src/tests/components/**/*.seed.ts`;          // Seed all APIs

    const seedFiles = glob.sync(pattern);

    if (seedFiles.length === 0) {
      console.error(`❌ No seed file found for pattern: ${pattern}`);
      console.error(`   Make sure the seed file exists and matches the naming convention`);
      process.exit(1);
    }

    console.log(`Found ${seedFiles.length} seed file(s)\n`);

    // Import and run seed for each file
    for (const file of seedFiles) {
      const fileName = path.basename(file, '.seed.ts');
      console.log(`  ▶ Seeding ${fileName}...`);

      const absolutePath = path.resolve(file);
      const module = await import(absolutePath);

      if (typeof module.seedAllTestData === 'function') {
        await module.seedAllTestData(dataSource);
        console.log(`  ✅ ${fileName} seeded successfully`);
      } else {
        console.warn(`  ⚠️  ${fileName}: No seedAllTestData() function found - skipping`);
      }
    }

    console.log('\n✅ All seeding completed!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

main();
