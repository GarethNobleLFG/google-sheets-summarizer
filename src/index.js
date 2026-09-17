import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import dailySummaryRoutes from './routes/generate-daily-sheet-summary.route.js';
import generalSummaryRoutes from './routes/generate-general-sheet-summary.route.js';

dotenv.config();

const port = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Google Sheets Summarizer API',
        status: 'Server is running successfully!',
    });
});
app.use('/api/daily-summary', dailySummaryRoutes);
app.use('/api/general-summary', generalSummaryRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

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
