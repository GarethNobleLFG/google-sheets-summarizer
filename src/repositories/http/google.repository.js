import { google } from 'googleapis';

/**
 * Authenticates with Google Auth and returns an initialized Google Sheets API client.
 * 
 * @param {Object} credentials - Google service account credentials
 * @returns {Promise<{success: boolean, sheets?: object, auth?: object, error?: string}>}
 */
export async function authenticateGoogleClient(credentials) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        return { success: true, sheets, auth };
    } catch (error) {
        console.error('Google API Authentication failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches cell data/values from a Google Spreadsheet range.
 * 
 * @param {object} sheetsClient - Authenticated Google Sheets client instance
 * @param {string} spreadsheetId - ID of the target spreadsheet
 * @param {string} range - Sheet range (default: 'A:Z')
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function fetchSpreadsheetValues(sheetsClient, spreadsheetId, range = 'A:Z') {
    try {
        const response = await sheetsClient.spreadsheets.values.get({
            spreadsheetId,
            range
        });

        return { success: true, data: response.data.values };
    } catch (error) {
        console.error('Error fetching sheet data from Google API:', error);
        return { success: false, error: error.message };
    }
}
