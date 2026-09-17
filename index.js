import dotenv from 'dotenv';
import express from 'express';
import dailySummaryRoutes from './src/routes/generate-daily-sheet-summary.route.js';
import generalSummaryRoutes from './src/routes/generate-general-sheet-summary.route.js';

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Google Sheets Summarizer API',
        status: 'Server is running successfully!',
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}!`);
    });
}

export default app;
