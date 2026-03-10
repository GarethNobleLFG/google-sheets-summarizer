import dotenv from 'dotenv';
import express from 'express';
import { DatabaseManager } from './config/databaseSetup.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Initialize database on first request.
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
                message: error.mesWsage
            });
        }
    }
    next();
});

// Import routes
import dailySummaryRoutes from './routes/dailySheetSummary.js';
import generalSummaryRoutes from './routes/generalSheetSummary.js';

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

export default app;