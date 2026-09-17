import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendMessage(message) {
    try {
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.YOUR_EMAIL,
            subject: `${message.messageType} - ${new Date().toLocaleDateString('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })}`,
            html: message.html
        });

        return { success: true };
    }
    catch (error) {
        console.error('Error sending messages:', error.message);
        throw error;
    }
}