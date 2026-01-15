function extractSpreadsheetId(url) {
  // Match the pattern for Google Sheets URLs
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If no match, assume the input is already an ID
  return url;
}

module.exports = {
  extractSpreadsheetId
};