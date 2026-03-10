import dotenv from 'dotenv';
import pool from './database.js';
import { createDatabase } from '../modules/createDatabase.js';
import { runAllPending } from '../migrations/migrate.js';

dotenv.config();

export async function initializeDatabase() {
    // Only create database in local development
    const dbResult = await createDatabase();
    if (dbResult.error) {
        throw new Error(`Database setup failed: ${dbResult.error}`);
    }

    // Run migrations
    try {
        await runAllPending();
    }
    catch (error) {
        console.error('Migration failed:', error.message);
        throw new Error(`Migration failed: ${error.message}`);
    }

    console.log('Database initialization complete');
}

export async function closeDatabase() {
    await pool.end();
}