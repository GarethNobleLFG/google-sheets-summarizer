const pool = require('../../config/database');              
const { createDatabase } = require('../../database/scripts/createDatabase'); 
const { MigrationRunner } = require('../../migrations/migrate');    



class DatabaseManager {
    static async initialize() {
        // Create database if needed
        const dbResult = await createDatabase();
        if (dbResult.error) {
            throw new Error(`Database setup failed: ${dbResult.error}`);
        }



        // Test connection with error handling
        let client;
        try {
            client = await pool.connect();
            console.log('Connected to PostgreSQL database successfully');

            const result = await client.query('SELECT NOW() as current_time');
            console.log('Database connection test completed:', result.rows[0].current_time);

        }
        catch (error) {
            console.error('Database connection test failed:', error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        }
        finally {
            // Always release the client, even if there's an error
            if (client) {
                client.release();
            }
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

    static getPool() {
        return pool;
    }
}

module.exports = { DatabaseManager };