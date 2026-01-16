const { google } = require('googleapis');
const fs = require('fs');



async function authenticate(credentials) {
    try {
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





module.exports = {
    authenticate,
    getSheetData
};