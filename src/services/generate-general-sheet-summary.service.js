import dotenv from 'dotenv';
import { sendMessage } from './node-mailer.service.js';
import { processSheetForAI } from './google-sheet-extract.service.js';
import { sendChat } from '../repositories/http/openai.repository.js';

dotenv.config();

export async function generateGeneralSummary() {
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

        const analysisData = await sendChat([
            {
                role: "system",
                content: "You are a data analyist."
            },
            {
                role: "user",
                content: analysisPrompt
            }
        ]);

        const generalPrompt = `
            You are a financial analyst for Google Sheets. Analyze this budget data.

            RULES:
                - Ignore tuition and housing categories (except electricity)
                - Use exact dollar amounts from the data
                - Cash amounts gained in green, red in deficit

            BUDGET DATA:
            ${analysisData}

            RESPONSE FORMAT: Provide EXACTLY this structure:

            **The General Info On Your Spending:**

            [Write a decently long and comprehensive review/report on the budget data. Include actionable advice on it]

            HTML_VERSION_START
            [Same content but formatted as clean HTML for email]
            Use: <h3> for section headers, <strong> for emphasis, <ul><li> for lists, 
            <p> for paragraphs, and inline styles for colors (green for positive, red for negative amounts)
            HTML_VERSION_END
        `;

        const fullResponse = await sendChat([
            {
                role: "system",
                content: "You are a professional financial analyst who provides clear, actionable budget insights."
            },
            {
                role: "user",
                content: generalPrompt
            }
        ]);

        const htmlMatch = fullResponse.match(/HTML_VERSION_START([\s\S]*?)HTML_VERSION_END/);
        const htmlVersion = htmlMatch ? htmlMatch[1].trim() : `<p>${fullResponse.replace(/\n/g, '</p><p>')}</p>`;

        const response = {
            html: htmlVersion,
            messageType: 'General Budget Summary',
            success: true
        };

        await sendMessage(response);

        return {
            success: true,
            html: htmlVersion,
            messageType: 'General Budget Summary'
        };

    }
    catch (error) {
        console.error('Error in general summary generation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
