require('dotenv').config();

const { processSheetForAI } = require('./googleSheetsService');

const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;

