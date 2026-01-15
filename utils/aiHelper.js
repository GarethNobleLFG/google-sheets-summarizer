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
    generateAIContext
};