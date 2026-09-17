import dotenv from 'dotenv';
import { sendMessage } from './node-mailer.service.js';
import { processSheetForAI } from './google-sheet-extract.service.js';
import { sendChat } from '../repositories/http/openai.repository.js';

dotenv.config();

export async function generateDailySummary() {
    const spreadsheetUrl = process.env.GOOGLE_SHEET_URL;
    const sheetName = process.env.SHEET_NAME;

    const sheetOptions = {
        range: sheetName ? `${sheetName}!A:Z` : 'A:Z',
        filterEmptyRows: true,
        maxPreviewRows: 100
    };

    try {
        const sheetData = await processSheetForAI(spreadsheetUrl, sheetOptions);

        if (!sheetData.success) {
            throw new Error(`Failed to process sheet: ${sheetData.error}`);
        }

        const analysisPrompt = `
            RULES:
                - Use exact dollar amounts from the data

            BUDGET DATA:
            ${sheetData.csvContent}

            RESPONSE:
                * Weekly income: $[week 1 total income], $[week 2 total income], $[week 3 total income], $[week 4 total income], $[week 5 total income]
                * Total monthly income: $[month's total income]
                * Total monthly expenses: $[month's total expenses]
                * List most expensive categories and their cash amounts, ignore tuition and housing categories such as rent (except electricity).

            Format your response like this and only this:
        `;

        const analysisData = await sendChat({
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
            model: "gpt-4o",
            maxTokens: 2500,
            temperature: 0.1
        });

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

            HTML_VERSION_START
            [Same content but formatted as clean HTML for email]
            Use: <h3> for section headers, <strong> for emphasis, <ul><li> for lists, 
            <p> for paragraphs, and inline styles for colors (green for positive, red for negative amounts)
            HTML_VERSION_END
        `;

        const fullResponse = await sendChat({
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
            model: "gpt-4o",
            maxTokens: 2500,
            temperature: 0.1
        });

        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);

        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;

        const response = {
            html: htmlVersion,
            messageType: 'Daily Budget Summary',
            success: true
        };

        await sendMessage(response);

        return {
            success: true,
            html: htmlVersion,
            messageType: 'Daily Budget Summary'
        };

    } 
    catch (error) {
        console.error('Error in daily summary generation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
