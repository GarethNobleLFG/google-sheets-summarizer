const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

class MigrationRunner {

    static async ensureMigrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(query);
    }


    static async getAppliedMigrations() {
        const result = await pool.query(
            'SELECT version FROM schema_migrations ORDER BY version'
        );
        return result.rows.map(row => row.version);
    }


    static async getPendingMigrations() {
        const appliedMigrations = await this.getAppliedMigrations();
        const migrationFiles = fs.readdirSync(__dirname)
            .filter(file => file.endsWith('.sql'))
            .sort();

        return migrationFiles.filter(file => {
            const version = file.split('_')[0];
            return !appliedMigrations.includes(version);
        });
    }


    static async runMigration(filename) {
        const filePath = path.join(__dirname, filename);
        const sql = fs.readFileSync(filePath, 'utf8');
        const version = filename.split('_')[0];
        const name = filename.replace('.sql', '').replace(/^\d+_/, '');

        console.log(`🔄 Running migration: ${filename}`);

        try {
            // Begin transaction
            await pool.query('BEGIN');
            
            // Execute migration SQL
            await pool.query(sql);
            
            // Record migration as applied
            await pool.query(
                'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
                [version, name]
            );
            
            // Commit transaction
            await pool.query('COMMIT');
            
            console.log(`✅ Migration completed: ${filename}`);
        } 
        catch (error) {
            // Rollback on error
            await pool.query('ROLLBACK');
            throw error;
        }
    }


    static async runAllPending() {
        console.log('🔍 Checking for pending migrations...');
        
        await this.ensureMigrationsTable();
        const pendingMigrations = await this.getPendingMigrations();

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            await this.runMigration(migration);
        }

        console.log('🎉 All migrations completed successfully');
    }
}



module.exports = { MigrationRunner };



// Run if called directly
if (require.main === module) {
    MigrationRunner.runAllPending()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        });
}