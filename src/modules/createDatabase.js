import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

// Essential for later DB connections because this is required to be made first.
export async function createDatabase() {
    try {
        // Check if database already exists.
        const checkResult = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1", [process.env.DB_NAME]
        );

        if (checkResult.rows.length > 0) {
            console.log(`Database "${process.env.DB_NAME}" already exists`);
            return { exists: true };
        }

        // Database doesn't exist, create it
        const dbName = process.env.DB_NAME;
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(dbName)) {
            throw new Error(`Invalid database name: ${dbName}`);
        }

        await pool.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${process.env.DB_NAME}" created successfully!`);
        return { created: true };
    }
    catch (error) {
        console.error('❌ Error with database:', error.message);
        return { error: error.message };
    }
}

// ES6 equivalent of "run if called directly"
if (import.meta.url === `file://${process.argv[1]}`) {
    createDatabase();
}