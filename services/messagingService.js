require('dotenv').config();
const twilio = require('twilio');
const nodemailer = require('nodemailer');


// Initialize services
//const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



async function sendMessage(message) {
    try {
        /*
        // Send via SMS
        await twilioClient.messages.create({
            body: `Daily Budget Summary:\n\n${message.text}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.YOUR_PHONE_NUMBER
        });
        */

        // Send email
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.YOUR_EMAIL,
            subject: `Daily Budget Summary - ${new Date().toLocaleDateString('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })}`,
            text: message.text,
            html: message.html
        });


        return { success: true }; 
    } 
    catch (error) {
        console.error('Error sending messages:', error.message);
        throw error;
    }
}




module.exports = {
    sendMessage
};