require('dotenv').config();

const { processSheetForAI } = require('../services/google/googleSheetService');
const { generateDailySummary } = require('../services/generateDailySummary');
const sheetSummary = require('../modules/sheetSummary');

const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;

async function dailySheetSummary(req, res) {
    try {
        // Step 1: Process and get result from google sheet using the URL
        const sheetData = await processSheetForAI(spreadsheetUrl, {
            range: `${sheetName}!A:Z`, // Target the specific sheet
            filterEmptyRows: true,
            maxPreviewRows: 100
        });

        if (!sheetData.success) {
            throw new Error(`Failed to process sheet: ${sheetData.error}. Ya messed up, bum.`);
        }

        // Step 2: Generate analysis and send message using the service
        const analysisResult = await generateDailySummary(sheetData.csvContent);

        if (!analysisResult.success) {
            throw new Error(`Failed to generate analysis: ${analysisResult.error}`);
        }

        // Step 3: Save to database
        try {
            const summaryData = {
                summary_type: 'Daily Budget Summary',
                text_version: analysisResult.text,
                html_version: analysisResult.html
            };

            const savedSummary = await sheetSummary.create(summaryData);
            console.log('Summary saved to database with ID:', savedSummary.id);
        } catch (dbError) {
            console.log('Failed to save to database in API call: ', dbError.message);
        }

        // Finally: Send success response
        res.status(200).json({
            success: true,
            message: 'Daily summary sent successfully',
            timestamp: new Date().toISOString()
        });

    } 
    catch (error) {
        console.error('Error generating monthly budget summary:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to generate daily summary',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = {
    dailySheetSummary
};