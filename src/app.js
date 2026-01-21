const express = require('express');

function createApp() {
    const app = express();


    // Middleware
    app.use(express.json());


    
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

    return app;
}

module.exports = { createApp };