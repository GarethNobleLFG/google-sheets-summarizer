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
            You are a financial analyst. Analyze this budget data and provide a concise summary.

            BUDGET DATA:
            ${sheetData.csvContent}

            REQUIREMENTS:
                - Keep total response under 1500 characters
                - Use plain text (no markdown formatting) 
                - Focus on actionable weekly spending insights
                - Be specific with dollar amounts when possible

            Provide a brief summary covering:

            1. FINANCIAL SNAPSHOT
                - Weekly income vs expenses with totals
                - Net result (savings/deficit)

            2. TOP SPENDING AREAS
                - 3 highest expense categories with amounts
                - Any concerning patterns
                - Ignore tuition expenses as these come out of savings

            3. ACTIONABLE RECOMMENDATIONS  
                - 2-3 specific ways to improve next week's spending
                - Focus on realistic habit changes

            4. QUICK METRICS
                - Savings rate percentage
                - Biggest expense category

            Keep each section to 2-3 sentences maximum. Use dollar figures and percentages.
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