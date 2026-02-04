require('dotenv').config();
const OpenAI = require('openai');

const { sendMessage } = require('../services/messagingService');
const { processSheetForAI } = require('../services/google/googleSheetService');
const sheetSummary = require('../database/repositories/sheetSummary');



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
const sheetName = process.env.SHEET_NAME;




async function generalSheetSummary(req, res) {
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


        // Step 2: Create the analysis prompt for OpenAI to collect correct data from sheet.
        const analysisPrompt = `
            RULES:
                - Ignore tuition and housing categories such as rent (except electricity)
                - Use exact dollar amounts from the data
                - Cash amounts gained in green, red in deficit

            BUDGET DATA:
            ${sheetData.csvContent}

            RESPONSE:
                * Weekly income: $[week 1 total income], $[week 2 total income], $[week 3 total income], $[week 4 total income], $[week 5 total income]
                * Total monthly income: $[month's total income]
                * Total monthly expenses: $[month's total expenses]
                * List most expensive categories with respect to the given rules and their cash amounts.

            Format your response like this and only this:
            `;


        // Step 3: Make OpenAI API call.
        const callOpenAi = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a data analyist."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            max_tokens: 2500,
            temperature: 0.1
        });



        // Step 4: Parse the response to extract analysis message.
        const gptResponse = callOpenAi.choices[0].message.content;

        const analysisResponse = gptResponse ? gptResponse.trim() : '';


        // Step 5: Create summary prompt.
        const generalPrompt = `
            You are a financial analyst for Google Sheets. Analyze this budget data.

            RULES:
                - Ignore tuition and housing categories (except electricity)
                - Use exact dollar amounts from the data
                - Cash amounts gained in green, red in deficit

            BUDGET DATA:
            ${analysisResponse}

            RESPONSE FORMAT: Provide EXACTLY this structure:

            **The General Info On Your Spending:**

            [Write a decently long and comprehensive review/report on the budget data. Include actionable advice on it]

            TEXT_VERSION_START
            [Plain text version - no formatting, just clean readable text]
            TEXT_VERSION_END

            HTML_VERSION_START
            [Same content but formatted as clean HTML for email]
            Use: <h3> for section headers, <strong> for emphasis, <ul><li> for lists, 
            <p> for paragraphs, and inline styles for colors (green for positive, red for negative amounts)
            HTML_VERSION_END
            `;


        // Step 6: Call OpenAI again and summarize the important data.
        const callOpenAiAgain = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional financial analyst who provides clear, actionable budget insights."
                },
                {
                    role: "user",
                    content: generalPrompt
                }
            ],
            max_tokens: 2500,
            temperature: 0.1
        });



        // Step 7: Parse the response to extract both message types.
        const fullResponse = callOpenAiAgain.choices[0].message.content;

        const textMatch = fullResponse.match(/TEXT_VERSION_START([\s\S]*?)TEXT_VERSION_END/);
        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);

        const textVersion = textMatch ? textMatch[1].trim() : fullResponse;
        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;



        // Step 8: Collect both responses.
        const response = {
            text: textVersion,
            html: htmlVersion,
            messageType: 'General Budget Summary',
            success: true
        };



        // Step 9: Save to database
        try {
            const summaryData = {
                summary_type: 'General Budget Summary',
                text_version: textVersion,
                html_version: htmlVersion
            };

            const savedSummary = await sheetSummary.create(summaryData);
            console.log('Summary saved to database with ID:', savedSummary.id);
        }
        catch (dbError) {
            console.log('Failed to save to database in API call: ', dbError.message);
        }




        // Step 10: Send messages of response.
        await sendMessage(response);




        // Finally: Send success response,
        res.status(200).json({
            success: true,
            message: 'General summary sent successfully',
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
    generalSheetSummary
};