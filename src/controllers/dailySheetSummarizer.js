require('dotenv').config();

const { generateDailySummary } = require('../services/generateDailySummary');
const sheetSummary = require('../modules/sheetSummary');

const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;

async function dailySheetSummary(req, res) {
    try {
        // Step 1: Generate analysis and send message using the service (includes sheet processing)
        const analysisResult = await generateDailySummary(spreadsheetUrl, {
            range: `${sheetName}!A:Z`, // Target the specific sheet
            filterEmptyRows: true,
            maxPreviewRows: 100
        });

        if (!analysisResult.success) {
            throw new Error(`Failed to generate analysis: ${analysisResult.error}`);
        }

        // Finally: Send success response
        res.status(200).json({
            success: true,
            message: 'Daily summary sent successfully',
            timestamp: new Date().toISOString()
        });

    } 
    catch (error) {
        console.error('Error generating daily budget summary:', error);

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