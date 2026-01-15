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

module.exports = {
    analyzeDataTypes
};