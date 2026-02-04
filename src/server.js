require('dotenv').config();
const app = require('./app');
const { DatabaseManager } = require('./database');

async function startServer() {
    try {
        // Initialize database
        await DatabaseManager.initialize();


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