const { google } = require('googleapis');
const fs = require('fs');



async function authenticate(credentialsPath = './credentials.json') {
    try {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        return { success: true, sheets, auth };
    }
    catch (error) {
        console.error('Authentication failed:', error);
        return { success: false, error: error.message };
    }
}




async function getSheetData(sheets, spreadsheetId, range = 'A:Z') {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        return { success: true, data: response.data.values };
    }
    catch (error) {
        console.error('Error fetching sheet data:', error);
        return { success: false, error: error.message };
    }
}





function convertToCSVString(data) {
    return data.map(row =>
        row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}





function analyzeDataTypes(headers, dataRows) {
    const analysis = {};

    headers.forEach((header, colIndex) => {
        const columnData = dataRows.map(row => row[colIndex]).filter(cell => cell);

        if (columnData.length === 0) {
            analysis[header] = 'empty';
            return;
        }

        const sample = columnData.slice(0, 10);

        if (sample.every(val => !isNaN(val) && !isNaN(parseFloat(val)))) {
            analysis[header] = 'numeric';
        }
        else if (sample.every(val => /^[$€£¥₹₽][\d,]+\.?\d*$/.test(val.toString().trim()))) {
            analysis[header] = 'currency';
        }
        else if (sample.every(val => /^\d+\.?\d*\s*(USD|EUR|GBP|JPY|CAD|AUD)$/i.test(val.toString().trim()))) {
            analysis[header] = 'currency';
        }
        else if (sample.every(val => /^\d{4}-\d{2}-\d{2}/.test(val))) {
            analysis[header] = 'date';
        }
        else if (sample.every(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
            analysis[header] = 'email';
        }
        else {
            analysis[header] = 'text';
        }
    });

    return analysis;
}





function generateAIContext(headers, summary, csvContent) {
    return {
        description: `Google Sheet data with ${summary.totalRows} rows and ${summary.totalColumns} columns`,
        columns: headers.map((header, index) => ({
            name: header,
            type: summary.dataTypes[header],
            position: index + 1
        })),
        csvPreview: csvContent.split('\n').slice(0, 6).join('\n'),
        readyForProcessing: true,
        suggestedPrompt: `Analyze this spreadsheet data with columns: ${headers.join(', ')}. The data contains ${summary.totalRows} rows of information.`
    };
}




module.exports = {
    authenticate,
    getSheetData,
    convertToCSVString,
    analyzeDataTypes,
    generateAIContext
};