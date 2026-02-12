const pool = require('./database');
const { createDatabase } = require('../modules/createDatabase');
const { MigrationRunner } = require('../migrations/migrate');

class DatabaseManager {
    static async initialize() {
        // Only create database in local development

        const dbResult = await createDatabase();
        if (dbResult.error) {
            throw new Error(`Database setup failed: ${dbResult.error}`);
        }


        // Run migrations
        try {
            await MigrationRunner.runAllPending();
        }
        catch (error) {
            console.error('Migration failed:', error.message);
            throw new Error(`Migration failed: ${error.message}`);
        }

        console.log('Database initialization complete');
    }

    static async close() {
        await pool.end();
    }
}

module.exports = { DatabaseManager };