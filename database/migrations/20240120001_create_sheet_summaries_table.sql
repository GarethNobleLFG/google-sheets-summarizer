-- Migration: Create sheet_summaries table
-- Version: 20240120001
-- Description: Initial table creation for storing sheet summaries

CREATE TABLE sheet_summaries (
    id SERIAL PRIMARY KEY,
    summary_type TEXT NOT NULL,
    text_version TEXT NOT NULL,
    html_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sheet_summaries_type ON sheet_summaries(summary_type);
CREATE INDEX idx_sheet_summaries_created_at ON sheet_summaries(created_at DESC);