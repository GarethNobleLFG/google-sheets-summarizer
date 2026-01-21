require('dotenv').config();
const express = require('express');
const app = express();

// Import database connection
const pool = require('./config/database');
const { MigrationRunner } = require('./migrations/migrate');

// Import routes:
const dailySummaryRoutes = require('./routes/dailySheetSummary');
const generalSummaryRoutes = require('./routes/generalSheetSummary');




// Database connection test.
pool.connect()
    .then(client => {
        console.log('✅ Connected to PostgreSQL database successfully');
        return client.query('SELECT NOW() as current_time')
            .then(result => {
                console.log('📊 Database connection test completed:', result.rows[0].current_time);
                client.release();
            });
    })
    .catch(error => {
        console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    });


// Migration runner upon startup. Ensure consistency in database structure.
(async () => {
    try {
        // Run pending migrations
        await MigrationRunner.runAllPending();
    } 
    catch (error) {
        console.error('❌ Failed to start application:', error.message);
        process.exit(1);
    }
})();






// Middleware to parse JSON bodies
app.use(express.json());





// Route implementations.
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Google Sheets Summarizer API',
        status: 'Server is running successfully!',
        database: 'Connected to PostgreSQL'
    });
});
app.use('/daily-summary', dailySummaryRoutes);
app.use('/general-summary', generalSummaryRoutes);







// 404 handler - FIXED: removed the problematic '*' parameter
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});





// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});





// Start the server
if (process.env.NODE_ENV === 'development') {
    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server is running on port ${process.env.PORT}!`);
    });
}










module.exports = { app, pool };