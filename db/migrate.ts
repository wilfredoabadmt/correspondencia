import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file');
}

const runMigrate = async () => {
    console.log('Applying migrations...');

    const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(migrationClient);

    await migrate(db, { migrationsFolder: 'db/migrations' });

    console.log('Migrations applied successfully!');
    await migrationClient.end();
};

runMigrate().catch((err) => {
    console.error('Error applying migrations:', err);
    process.exit(1);
});