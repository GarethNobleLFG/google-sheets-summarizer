const pool = require('../config/database');

class SheetSummary {
    constructor(data) {
        this.id = data.id;
        this.sheet_url = data.sheet_url;
        this.sheet_name = data.sheet_name;
        this.summary_type = data.summary_type;
        this.summary_content = data.summary_content;
        this.text_version = data.text_version;
        this.raw_data = data.raw_data;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}

module.exports = SheetSummary;