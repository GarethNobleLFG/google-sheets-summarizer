require('dotenv').config();

const { processSheetForAI } = require('../services/googleSheetsService');

const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;

