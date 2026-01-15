require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;



// Middleware to parse JSON bodies
app.use(express.json());



// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Google Sheets Summarizer API',
    status: 'Server is running successfully!'
  });
});




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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!!`);
});

module.exports = app;