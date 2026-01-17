-- Rainfall Records table for tracking precipitation
-- Migration: 032_rainfall_records.sql

CREATE TABLE IF NOT EXISTS rainfall_records (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    record_date DATE NOT NULL,
    amount_inches DECIMAL(6, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient queries by tenant and date
CREATE INDEX IF NOT EXISTS idx_rainfall_tenant_date ON rainfall_records(tenant_id, record_date);

-- Index for year-based filtering
CREATE INDEX IF NOT EXISTS idx_rainfall_year ON rainfall_records(tenant_id, EXTRACT(YEAR FROM record_date));
