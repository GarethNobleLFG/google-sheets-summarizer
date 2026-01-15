require('dotenv').config();
const { processSheetForAI } = require('../google-sheet-services/googleSheetService');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;


async function weeklySheetSummary() {
    try {

        // Step 1: Process and get result from google sheet using the URL.
        const sheetData = await processSheetForAI(spreadsheetUrl, {
            range: `${sheetName}!A:Z`, // Target the specific sheet.
            filterEmptyRows: true,
            maxPreviewRows: 100
        });

        if (!sheetData.success) {
            throw new Error(`Failed to process sheet: ${sheetData.error}. Ya messed up, bum.`);
        }


        // Step 2: Create the prompt for OpenAI to summarize sheet.
        const prompt = `
            You are a financial analyst. Please analyze this monthly budget data and create a comprehensive summary.

            BUDGET DATA:
            ${sheetData.csvContent}

            DATA CONTEXT:
                - Total rows: ${sheetData.rowCount}
                - Columns: ${sheetData.headers.join(', ')}
                - Data types: ${JSON.stringify(sheetData.summary.dataTypes, null, 2)}

            Please provide a monthly budget summary that includes:

            1. **FINANCIAL OVERVIEW**
                - Total income vs total expenses
                - Net savings/deficit
                - Budget variance analysis

            2. **SPENDING BREAKDOWN**
                - Top spending categories
                - Percentage breakdown by category
                - Any concerning spending patterns

            3. **INSIGHTS & RECOMMENDATIONS**
                - Areas where you're over/under budget
                - Opportunities to save money
                - Suggestions for next month

            4. **KEY METRICS**
                - Savings rate
                - Expense ratios
                - Month-over-month changes (if applicable)

            Format the response in clean markdown with clear sections and bullet points.
            `;


        // Step 3: Make OpenAI API call.
        const callOpenAi = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional financial analyst who provides clear, actionable budget insights."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });


        // Step 4: Return the response from OpenAI.
        return callOpenAi.choices[0].message.content;
    }
    catch (error) {
        console.error('Error generating monthly budget summary:', error);
        throw error;
    }
}



module.exports = {
    weeklySheetSummary
};