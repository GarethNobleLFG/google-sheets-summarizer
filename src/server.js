require('dotenv').config();
const { createApp } = require('./app');
const { DatabaseManager } = require('./database');

async function startServer() {
    try {
        // Initialize database
        await DatabaseManager.initialize();



        // Create and configure app
        const app = createApp();



        // Import and register routes after DB is ready
        const dailySummaryRoutes = require('./routes/dailySheetSummary');
        const generalSummaryRoutes = require('./routes/generalSheetSummary');

        // Routes
        app.get('/', (req, res) => {
            res.json({
                message: 'Welcome to Google Sheets Summarizer API',
                status: 'Server is running successfully!',
                database: 'Connected to PostgreSQL'
            });
        });
        app.use('/daily-summary', dailySummaryRoutes);
        app.use('/general-summary', generalSummaryRoutes);




        // Start server
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT}!`);
        });


        
        return app;
    }
    catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

module.exports = { startServer };