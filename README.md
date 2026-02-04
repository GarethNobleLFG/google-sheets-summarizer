# Google Sheets Summarizer

A Node.js application that automatically analyzes and summarizes financial data from Google Sheets using AI-powered insights. The application connects to Google Sheets, processes budget data, generates intelligent summaries using OpenAI, and delivers reports via email.

## System Overview

**Google Sheets Summarizer API** - Receives, processes, and delivers AI-powered financial summaries from Google Sheets data
   - Node.js Express server with PostgreSQL storage
   - Integrates with Google Sheets API and OpenAI for intelligent analysis
   - Delivers summaries via email and SMS through multi-channel messaging system

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with migrations
- **AI Integration**: OpenAI API
- **Google Integration**: Google Sheets API
- **Email Service**: Nodemailer
- **Additional Services**: Twilio (SMS support)
- **Utilities**: CSV parsing and processing
