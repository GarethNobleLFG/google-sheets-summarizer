require('dotenv').config();

const { authenticate, getSheetData } = require('../utils/googleSheetsApi');
const { convertToCSVString } = require('../utils/dataFormatter');
const { extractSpreadsheetId } = require('../utils/urlHelper');


async function processSheetForAI(spreadsheetUrl, options = {}) {

    // Extract the spreadsheet ID.
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

    try {
        const {
            range = 'A:Z',
            includeMetadata = true,
            filterEmptyRows = true,
            maxPreviewRows = 100,
        } = options;


        const credentials = {
            type: process.env.GOOGLE_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER,
            client_x509_cert_url: process.env.GOOGLE_CERT_URL,
            universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
        }

        // Step 1: Authenticate
        console.log('Authenticating with Google Sheets...');
        const authResult = await authenticate(credentials);

        if (!authResult.success) {
            throw new Error(`Authentication failed: ${authResult.error}`);
        }



        const { sheets } = authResult;



        // Step 2: Get sheet data
        console.log('Fetching sheet data...');
        const sheetResult = await getSheetData(sheets, spreadsheetId, range);

        if (!sheetResult.success) {
            throw new Error(`Failed to fetch sheet data: ${sheetResult.error}`);
        }

        const rawData = sheetResult.data;

        if (!rawData || rawData.length === 0) {
            throw new Error('No data found in the specified sheet range');
        }





        // Step 3: Process and clean data
        let processedData = rawData;

        if (filterEmptyRows) {
            processedData = rawData.filter(row =>
                row && row.some(cell => cell && cell.toString().trim() !== '')
            );
        }



        // Step 4: Extract headers and data rows
        const headers = processedData[0] || [];
        const dataRows = processedData.slice(1);



        // Step 5: Generate CSV content
        const csvContent = convertToCSVString(processedData);




        // Step 6: Generate summary for better AI context.
        const summary = {
            totalRows: dataRows.length,
            totalColumns: headers.length,
            columnNames: headers,
        };




        // Complete result object
        const result = {
            success: true,
            spreadsheetId,
            range,
            timestamp: new Date().toISOString(),

            headers,

            // Processed formats
            csvContent,

            // Metadata and analysis
            summary,

            // Quick access properties
            rowCount: dataRows.length,
            columnCount: headers.length,
            isEmpty: dataRows.length === 0
        };



        console.log(`Successfully processed sheet: ${dataRows.length} rows, ${headers.length} columns`);

        // Finally return the needed context for AI to analyze.
        return result;
    }
    catch (error) {
        console.error('Error in processSheetForAI:', error);

        return {
            success: false,
            error: error.message,
            spreadsheetId,
            timestamp: new Date().toISOString()
        };
    }
}




module.exports = {
    processSheetForAI
};