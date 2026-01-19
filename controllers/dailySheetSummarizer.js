require('dotenv').config();
const OpenAI = require('openai');

const { sendMessage } = require('../services/messagingService');
const { processSheetForAI } = require('../services/google/googleSheetService');



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

            RULES:
                - Ignore tuition and housing categories (except electricity)
                - Use exact dollar amounts from the data
                - Keep each section under 3 sentences
                - Be consistent with formatting
                - Cash amounts gained in green, red in deficit

            BUDGET DATA:
            ${sheetData.csvContent}

            RESPONSE FORMAT: Provide EXACTLY this structure:

            **Hey, it's Jarvis for Google Sheets**

            **1. FINANCIAL SNAPSHOT**
                • Weekly income: $[week 1 total income], $[week 2 total income], $[week 3 total income], $[week 4 total income], $[week 5 total income]
                • Total monthly income: $[month's total income]
                • [Net savings/deficit with dollar amounts]

            **2. MOST EXPENSIVE SPENDING AREAS**
                • [List categories and their cash amounts]

            **3. ACTIONABLE RECOMMENDATIONS**
                • [Specific recommendations that are easy and not a hard to implement]

            **4. QUICK METRICS**
                Savings Rate: [X]% | Biggest Category: **[Category Name (thats not the excluded ones)]**

            **5. SAVINGS HACK**
                [One specific, actionable tip and a few budget friendly restuarant]

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
            messageType: 'Daily Budget Summary',
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