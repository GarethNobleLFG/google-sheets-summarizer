import { generateGeneralSummary } from '../services/generate-general-sheet-summary.service.js';

export async function generalSheetSummary(req, res) {
    try {
        const analysisResult = await generateGeneralSummary();

        if (!analysisResult.success) {
            throw new Error(`Failed to generate analysis: ${analysisResult.error}`);
        }

        res.status(200).json({
            success: true,
            message: 'General summary sent successfully',
            timestamp: new Date().toISOString()
        });

    } 
    catch (error) {
        console.error('Error generating general budget summary:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to generate general summary',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
