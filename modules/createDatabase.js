require('dotenv').config();
const { Client } = require('pg');

// Essential for later DB connections becuase this is required to be made first.
async function createDatabase() {
    // Connect to default postgres database first
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Connect to default DB
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();

        // Check if database already exists.
        const checkResult = await client.query(
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

        await client.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${process.env.DB_NAME}" created successfully!`);
        return { created: true };

    }
    catch (error) {
        console.error('❌ Error with database:', error.message);
        return { error: error.message };
    }
    finally {
        await client.end();
    }
}

module.exports = { createDatabase };

if (require.main === module) {
    createDatabase();
}