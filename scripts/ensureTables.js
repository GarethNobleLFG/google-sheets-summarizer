const { pool } = require('../index');
const { createTable } = require('./createTable');

async function ensureTablesExist() {
    try {
        // Check if table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'sheet_summaries'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        
        if (!tableExists) {
            console.log('📋 Creating tables...');
            await createTable();
        } 
        else {
            console.log('📋 Tables already exist');
        }
        
        return { success: true };
    } 
    catch (error) {
        console.error('❌ Error ensuring tables exist:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { ensureTablesExist };