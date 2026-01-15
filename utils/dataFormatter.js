function convertToCSVString(data) {
    return data.map(row =>
        row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

module.exports = {
    convertToCSVString
};