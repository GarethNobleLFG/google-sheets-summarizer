const pool = require('../config/database');

class sheetSummary {


    // Create a new summary
    static async create(summaryData) {
        const { summary_type, text_version, html_version } = summaryData;
        
        const query = `
            INSERT INTO sheet_summaries (summary_type, text_version, html_version)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        try {
            const result = await pool.query(query, [summary_type, text_version, html_version]);
            return result.rows[0]; // Just return the raw data
        } 
        catch (error) {
            throw new Error(`Failed to create summary: ${error.message}`);
        }
    }



    // Find by ID
    static async findById(id) {
        const query = 'SELECT * FROM sheet_summaries WHERE id = $1';

        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null; // Just return raw data
        } 
        catch (error) {
            throw new Error(`Failed to find summary: ${error.message}`);
        }
    }



    // Find all summaries
    static async findAll(limit = 50) {
        const query = `
            SELECT * FROM sheet_summaries 
            ORDER BY created_at DESC 
            LIMIT $1
        `;

        try {
            const result = await pool.query(query, [limit]);
            return result.rows; // Just return raw array
        } 
        catch (error) {
            throw new Error(`Failed to fetch summaries: ${error.message}`);
        }
    }



    // Find by type
    static async findByType(summaryType, limit = 20) {
        const query = `
            SELECT * FROM sheet_summaries 
            WHERE summary_type = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;

        try {
            const result = await pool.query(query, [summaryType, limit]);
            return result.rows; // Just return raw array
        } 
        catch (error) {
            throw new Error(`Failed to fetch summaries by type: ${error.message}`);
        }
    }



    // Delete a summary
    static async deleteById(id) {
        const query = 'DELETE FROM sheet_summaries WHERE id = $1 RETURNING *';

        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null; // Just return raw data
        } 
        catch (error) {
            throw new Error(`Failed to delete summary: ${error.message}`);
        }
    }
}

module.exports = sheetSummary;