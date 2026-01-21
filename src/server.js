require('dotenv').config();
const { createApp } = require('./app');
const { DatabaseManager } = require('./database');

async function startServer() {
    try {
        // Initialize database
        await DatabaseManager.initialize();



        // Create and configure app
        const app = createApp();



        // Start server
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}!`);
        });


        
        return app;
    }
    catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

module.exports = { startServer };