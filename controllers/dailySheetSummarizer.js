require('dotenv').config();
const OpenAI = require('openai');

const { sendMessage } = require('../utils/messagingService');
const { processSheetForAI } = require('../services/googleSheetService');



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;




async function dailySheetSummary(req, res) {
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
            You are Jarvis, a financial analyst for Google Sheets. Analyze this budget data.

            BUDGET DATA:
            ${sheetData.csvContent}

            RESPONSE FORMAT: Provide EXACTLY this structure:

            **Hey, it's Jarvis for Google Sheets**

            **1. FINANCIAL SNAPSHOT**
                • This week's income: [$ week's total income]
                • Total monthly income: [$ month's total income]
                • [Net savings/deficit with dollar amounts]

            **2. TOP SPENDING AREAS**
                • [Category 1]: $[amount]
                • [Category 2]: $[amount]
                • [Category 3]: $[amount]
                • [Category 4]: $[amount]
                • [Category 5]: $[amount]

            **3. ACTIONABLE RECOMMENDATIONS**
                • [Specific recommendation 1]
                • [Specific recommendation 2]
                • [Specific recommendation 3]

            **4. QUICK METRICS**
                Savings Rate: [X]% | Biggest Category: **[Category Name]**

            **5. SAVINGS HACK**
                [One specific, actionable tip and a few budget friendly restuarant]

            RULES:
                - Ignore tuition and housing (except electricity)
                - Use exact dollar amounts from the data
                - Keep each section under 3 sentences
                - Be consistent with formatting

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
            model: "gpt-4o",
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
            temperature: 0.1
        });



        // Step 4: Parse the response to extract both message types.
        const fullResponse = callOpenAi.choices[0].message.content;

        const textMatch = fullResponse.match(/TEXT_VERSION_START([\s\S]*?)TEXT_VERSION_END/);
        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);

        const textVersion = textMatch ? textMatch[1].trim() : fullResponse;
        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;



        // Step 5: Collect both responses.
        const response = {
            text: textVersion,
            html: htmlVersion,
            success: true
        };



        // Step 6: Send messages of response.
        await sendMessage(response);




        // Finally: Send success response,
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