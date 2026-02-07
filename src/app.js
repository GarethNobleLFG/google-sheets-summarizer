const express = require('express');

const app = express();


// Middleware
app.use(express.json());



// Import and register routes after DB is ready
const dailySummaryRoutes = require('../daily-summary/dailySheetSummary');
const generalSummaryRoutes = require('../routes/generalSheetSummary');



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