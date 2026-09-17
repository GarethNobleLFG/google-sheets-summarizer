import dotenv from 'dotenv';
import { authenticateGoogleClient, fetchSpreadsheetValues } from '../repositories/http/google.repository.js';
import { convertToCSVString } from '../utils/data-formatter.util.js';
import { extractSpreadsheetId } from '../utils/extract-sheet-id.util.js';

dotenv.config();

export async function processSheetForAI(spreadsheetUrl, options = {}) {
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
        };

        console.log('Authenticating with Google Sheets...');
        const authResult = await authenticateGoogleClient(credentials);

        if (!authResult.success) {
            throw new Error(`Authentication failed: ${authResult.error}`);
        }

        const { sheets } = authResult;

        console.log('Fetching sheet data...');
        const sheetResult = await fetchSpreadsheetValues(sheets, spreadsheetId, range);

        if (!sheetResult.success) {
            throw new Error(`Failed to fetch sheet data: ${sheetResult.error}`);
        }

        const rawData = sheetResult.data;

        if (!rawData || rawData.length === 0) {
            throw new Error('No data found in the specified sheet range');
        }

        let processedData = rawData;

        if (filterEmptyRows) {
            processedData = rawData.filter(row =>
                row && row.some(cell => cell && cell.toString().trim() !== '')
            );
        }

        const headers = processedData[0] || [];
        const dataRows = processedData.slice(1);

        const csvContent = convertToCSVString(processedData);

        const summary = {
            totalRows: dataRows.length,
            totalColumns: headers.length,
            columnNames: headers,
        };

        const result = {
            success: true,
            spreadsheetId,
            range,
            timestamp: new Date().toISOString(),
            headers,
            csvContent,
            summary,
            rowCount: dataRows.length,
            columnCount: headers.length,
            isEmpty: dataRows.length === 0
        };

        console.log(`Successfully processed sheet: ${dataRows.length} rows, ${headers.length} columns`);

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
