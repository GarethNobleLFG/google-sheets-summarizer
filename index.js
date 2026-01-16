require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT;
const { dailySheetSummary } = require('./services/summarizer-services/dailySheetSummarizer');



// Initialize services
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



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






// Create and send weekly sheet summary everyday at 8pm!
cron.schedule('0 20 * * *', async () => {
    try {
        const response = await dailySheetSummary();

        console.log(response.text);
        console.log('\n\n\n\n\n');
        console.log(response.html);

        try {
            // Send via SMS
            await twilioClient.messages.create({
                body: `Daily Budget Summary:\n\n${response.text}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.YOUR_PHONE_NUMBER
            })


            // Send email
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.YOUR_EMAIL,
                subject: `Daily Budget Summary - ${new Date().toLocaleDateString()}`,
                text: response.text,
                html: response.html
            })
        }
        catch (error) {
            console.error('Error sending messages:', error.message);
        }
    }
    catch (error) {
        console.error('Failed to generate summary:', error.message);
    }
}, {
    scheduled: true,
    timezone: "America/New_York"
});





module.exports = app;