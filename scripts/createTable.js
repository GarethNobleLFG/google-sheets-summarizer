const { pool } = require('../index');

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS sheet_summaries (
                id SERIAL PRIMARY KEY,
                summary_type VARCHAR(50) NOT NULL,
                text_version TEXT NOT NULL,
                html_version TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await pool.query(query);
        console.log('✅ Table created successfully!');
        process.exit(0);
    } 
    catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

module.exports = { createTable };

// Only run if called directly
if (require.main === module) {
    createTable();
}