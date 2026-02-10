require('dotenv').config();

const { generateGeneralSummary } = require('../services/generateGeneralSummary');
const sheetSummary = require('../modules/sheetSummary');

const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;

async function generalSheetSummary(req, res) {
    try {
        // Step 1: Generate analysis and send message using the service (includes sheet processing)
        const analysisResult = await generateGeneralSummary(spreadsheetUrl, {
            range: `${sheetName}!A:Z`, // Target the specific sheet
            filterEmptyRows: true,
            maxPreviewRows: 100
        });

        if (!analysisResult.success) {
            throw new Error(`Failed to generate analysis: ${analysisResult.error}`);
        }

        // Step 2: Save to database
        try {
            const summaryData = {
                summary_type: 'General Budget Summary',
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
            message: 'General summary sent successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating general budget summary:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to generate general summary',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = {
    generalSheetSummary
};