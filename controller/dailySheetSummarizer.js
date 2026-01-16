require('dotenv').config();
const { processSheetForAI } = require('../services/googleSheetService');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;


async function dailySheetSummary() {
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
                - Weekly income and monthly income vs expenses with totals
                - Net result (savings/deficit)

            2. TOP SPENDING AREAS
                - 3 highest expense categories with amounts
                - Any concerning patterns
                - Ignore tuition expenses as these come out of savings
                - Ignore housing expenses

            3. ACTIONABLE RECOMMENDATIONS  
                - 2-3 specific ways to improve next week's spending
                - Focus on realistic habit changes

            4. QUICK METRICS
                - Savings rate percentage
                - Biggest expense category

            Keep each section to 2-3 sentences maximum. Use dollar figures and percentages.

            Make two of the exact same repsones but just in the following formats:

            TEXT_VERSION_START
            [Plain text version - no formatting, just clean readable text]
            TEXT_VERSION_END

            HTML_VERSION_START
            [Same content but formatted as clean HTML for email]
            Use: <h3> for section headers, <strong> for emphasis, <ul><li> for lists, 
            <p> for paragraphs, and inline styles for colors (green for positive, red for negative amounts)
            HTML_VERSION_END
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
            max_tokens: 2500,
            temperature: 0.7
        });



        // Step 4: Parse the response to extract both message types.
        const fullResponse = callOpenAi.choices[0].message.content;

        const textMatch = fullResponse.match(/TEXT_VERSION_START([\s\S]*?)TEXT_VERSION_END/);
        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);

        const textVersion = textMatch ? textMatch[1].trim() : fullResponse;
        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;



        // Step 5: Return both.
        return {
            text: textVersion,
            html: htmlVersion,
            success: true
        };
    }
    catch (error) {
        console.error('Error generating monthly budget summary:', error);

        return {
            text: `Error generating summary: ${error.message}`,
            html: `<p style="color: red;">Error generating summary: ${error.message}</p>`,
            success: false,
            error: error.message
        };
    }
}



module.exports = {
    dailySheetSummary
};