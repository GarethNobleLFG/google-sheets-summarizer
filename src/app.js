require('dotenv').config();
const express = require('express');
const { DatabaseManager } = require('./config/databaseSetup');

const app = express();

// Middleware
app.use(express.json());

// Initialize database on first request (lazy loading)
let dbInitialized = false;

app.use(async (req, res, next) => {
    if (!dbInitialized) {
        try {
            await DatabaseManager.initialize();
            dbInitialized = true;
        } 
        catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            return res.status(500).json({
                error: 'Database initialization failed',
                message: error.message
            });
        }
    }
    next();
});

// Import routes
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

module.exports = app;