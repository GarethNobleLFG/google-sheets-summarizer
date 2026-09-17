import { generateDailySummary } from '../services/generate-daily-sheet-summary.service.js';

export async function dailySheetSummary(req, res) {
    try {
        const analysisResult = await generateDailySummary();

        if (!analysisResult.success) {
            throw new Error(`Failed to generate analysis: ${analysisResult.error}`);
        }

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
