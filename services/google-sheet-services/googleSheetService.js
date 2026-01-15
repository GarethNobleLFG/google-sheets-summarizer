const { authenticate, getSheetData } = require('../../utils/google-sheets-utils/googleSheetsApi');
const { convertToCSVString } = require('../../utils/google-sheets-utils/dataFormatter');
const { analyzeDataTypes } = require('../../utils/google-sheets-utils/dataAnalyzer');
const { extractSpreadsheetId } = require('../../utils/google-sheets-utils/urlHelper');


async function processSheetForAI(spreadsheetUrl, options = {}) {
    try {
        const {
            range = 'A:Z',
            includeMetadata = true,
            filterEmptyRows = true,
            maxPreviewRows = 100,
            credentialsPath = '../credentials.json'
        } = options;


        // Extract the spreadsheet ID.
        const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);


        // Step 1: Authenticate
        console.log('Authenticating with Google Sheets...');
        const authResult = await authenticate(credentialsPath);

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




        // Step 6: Create AI-ready data structure
        const aiReadyData = dataRows.map(row => {
            const rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header || `Column_${index + 1}`] = row[index] || '';
            });
            return rowObject;
        });




        // Step 7: Analyze data types for AI context.
        const dataTypes = analyzeDataTypes(headers, dataRows);




        // Step 8: Generate summary for better AI context.
        const summary = {
            totalRows: dataRows.length,
            totalColumns: headers.length,
            columnNames: headers,
            dataTypes: dataTypes,
            sampleData: aiReadyData.slice(0, maxPreviewRows)
        };




        // Complete result object
        const result = {
            success: true,
            spreadsheetId,
            range,
            timestamp: new Date().toISOString(),

            // Processed formats
            csvContent,

            // Metadata and analysis
            summary,
            aiContext,

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