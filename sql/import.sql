-- RetailIQ Executive Dashboard - Data Import Script
-- Run after schema.sql. Requires processed CSV files from the ETL pipeline.
--
-- Usage (from project root):
--   psql -d retailiq -f sql/schema.sql
--   psql -d retailiq -f sql/import.sql
--
-- Adjust the base path below to match your environment.

SET search_path TO retailiq, public;

-- Widen state_code if schema was created with VARCHAR(10) (UK rows use full names)
ALTER TABLE dim_customer ALTER COLUMN state_code TYPE VARCHAR(255);

\copy dim_date FROM 'data/processed/dim_date.csv' WITH (FORMAT csv, HEADER true, NULL '');
\copy dim_customer FROM 'data/processed/customers.csv' WITH (FORMAT csv, HEADER true, NULL '');
\copy dim_product FROM 'data/processed/products.csv' WITH (FORMAT csv, HEADER true, NULL '');
\copy dim_store FROM 'data/processed/stores.csv' WITH (FORMAT csv, HEADER true, NULL '');
\copy fact_exchange_rate (rate_date, currency, exchange_rate) FROM 'data/processed/exchange_rates.csv' WITH (FORMAT csv, HEADER true, NULL '');
\copy fact_sales FROM 'data/processed/sales.csv' WITH (FORMAT csv, HEADER true, NULL '');

-- Verify row counts
SELECT 'dim_date' AS table_name, COUNT(*) AS row_count FROM dim_date
UNION ALL SELECT 'dim_customer', COUNT(*) FROM dim_customer
UNION ALL SELECT 'dim_product', COUNT(*) FROM dim_product
UNION ALL SELECT 'dim_store', COUNT(*) FROM dim_store
UNION ALL SELECT 'fact_exchange_rate', COUNT(*) FROM fact_exchange_rate
UNION ALL SELECT 'fact_sales', COUNT(*) FROM fact_sales
ORDER BY table_name;
