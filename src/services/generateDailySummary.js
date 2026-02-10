require('dotenv').config();
const OpenAI = require('openai');
const { sendMessage } = require('./messagingService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateDailySummary(csvContent) {
    try {
        // Step 1: Create the analysis prompt for OpenAI to collect correct data from sheet
        const analysisPrompt = `
            RULES:
                - Use exact dollar amounts from the data

            BUDGET DATA:
            ${csvContent}

            RESPONSE:
                * Weekly income: $[week 1 total income], $[week 2 total income], $[week 3 total income], $[week 4 total income], $[week 5 total income]
                * Total monthly income: $[month's total income]
                * Total monthly expenses: $[month's total expenses]
                * List most expensive categories and their cash amounts, ignore tuition and housing categories such as rent (except electricity).

            Format your response like this and only this:
        `;

        // Step 2: Make OpenAI API call for analysis
        const analysisResponse = await openai.chat.completions.create({
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

        const analysisData = analysisResponse.choices[0].message.content?.trim() || '';

        // Step 3: Create summary prompt
        const summaryPrompt = `
            BUDGET DATA:
            ${analysisData}

            RESPONSE FORMAT: Provide EXACTLY this structure:

            **1. FINANCIAL SNAPSHOT**
                • Weekly income: $[week 1 total income], $[week 2 total income], $[week 3 total income], $[week 4 total income], $[week 5 total income]
                • Total monthly income: $[month's total income]
                • [Total savings or loss (monthly income - expenses)]

            **2. MOST EXPENSIVE SPENDING AREAS**
                • [List categories and their cash amounts]

            **3. ACTIONABLE RECOMMENDATIONS**
                • [Specific recommendations that are easy and not a hard to implement]

            **4. SAVINGS HACK**
                [One specific, actionable tip and a few budget friendly restuarant]

            Make two of the exact same responses but just in the following formats:

            TEXT_VERSION_START
            [Plain text version - no formatting, just clean readable text]
            TEXT_VERSION_END

            HTML_VERSION_START
            [Same content but formatted as clean HTML for email]
            Use: <h3> for section headers, <strong> for emphasis, <ul><li> for lists, 
            <p> for paragraphs, and inline styles for colors (green for positive, red for negative amounts)
            HTML_VERSION_END
        `;

        // Step 4: Call OpenAI again and summarize the important data
        const summaryResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional financial analyst who provides clear, actionable budget insights."
                },
                {
                    role: "user",
                    content: summaryPrompt
                }
            ],
            max_tokens: 2500,
            temperature: 0.1
        });

        // Step 5: Parse the response to extract both message types
        const fullResponse = summaryResponse.choices[0].message.content;

        const textMatch = fullResponse.match(/TEXT_VERSION_START([\s\S]*?)TEXT_VERSION_END/);
        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);

        const textVersion = textMatch ? textMatch[1].trim() : fullResponse;
        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;

        // Step 6: Send the message
        const response = {
            text: textVersion,
            html: htmlVersion,
            messageType: 'Daily Budget Summary',
            success: true
        };

        await sendMessage(response);

        return {
            success: true,
            text: textVersion,
            html: htmlVersion,
            messageType: 'Daily Budget Summary'
        };

    } 
    catch (error) {
        console.error('Error in OpenAI analysis:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    generateDailySummary
};