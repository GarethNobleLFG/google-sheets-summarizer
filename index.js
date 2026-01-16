require('dotenv').config();
const express = require('express');
const app = express();

// Import routes
const dailySummaryRoutes = require('./routes/dailySheetSummary');





// Middleware to parse JSON bodies
app.use(express.json());





// Route implementations.
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Google Sheets Summarizer API',
        status: 'Server is running successfully!'
    });
});
app.use('/daily-summary', dailySummaryRoutes);







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
        console.log(`Server is running on port ${process.env.PORT}!!`);
    });
}





module.exports = app;