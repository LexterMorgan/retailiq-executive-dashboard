# Data Quality Report

Generated from inspection of `data/raw/` source files.

## Summary

| Table | Rows | PK Unique | Encoding | Issues Found |
|-------|------|-----------|----------|--------------|
| Sales | 62,884 | Yes (order_number, line_item) | UTF-8 | 79% missing delivery dates |
| Customers | 15,266 | Yes (customer_key) | Latin-1 | 10 missing state codes |
| Products | 2,517 | Yes (product_key) | UTF-8 | Currency-formatted price strings |
| Stores | 67 | Yes (store_key) | UTF-8 | 1 NULL square_meters (Online store) |
| Exchange Rates | 11,215 | Yes (date, currency) | UTF-8 | None |

## Referential Integrity

All foreign keys in Sales resolve correctly:
- 0 orphan customer_key values
- 0 orphan product_key values
- 0 orphan store_key values (including StoreKey 0 = Online)

## Issues & Remediation

### 1. Missing Delivery Dates (Sales)
- **Impact**: 49,719 of 62,884 line items (79%) have no delivery date
- **Likely cause**: Orders not yet delivered, cancelled, or data not captured
- **ETL handling**: Preserved as NULL; delivery metrics use only populated dates
- **BI note**: Use delivery completion rate KPI; do not treat NULL as zero-day delivery

### 2. Currency-Formatted Prices (Products)
- **Impact**: `Unit Cost USD` and `Unit Price USD` stored as strings like `"$6.62 "`
- **ETL handling**: Stripped `$`, commas, whitespace; converted to numeric

### 3. Missing State Codes (Customers)
- **Impact**: 10 customers have NULL state_code
- **ETL handling**: Filled with `'UNK'`

### 4. Online Store (Stores)
- **Impact**: StoreKey 0 has NULL square_meters
- **ETL handling**: Preserved NULL; `is_online` flag in schema excludes from sqm metrics

### 5. Encoding (Customers)
- **Impact**: UTF-8 decode fails on special characters (e.g. ü in German names)
- **ETL handling**: Automatic encoding detection via chardet (detects Latin-1)

### 6. Date Formats
- **Impact**: All dates stored as M/D/YYYY strings
- **ETL handling**: Parsed to ISO 8601 (`YYYY-MM-DD`) in processed output

## Data Ranges

| Field | Min | Max |
|-------|-----|-----|
| Order Date | 2016-01-01 | 2021-02-20 |
| Exchange Rate Date | 2015-01-01 | 2021-02-20 |
| Quantity | 1 | 10 |
| Currencies | AUD, CAD, EUR, GBP, USD | — |

## Currency Distribution (Sales)

| Currency | Line Items | Share |
|----------|------------|-------|
| USD | 33,767 | 53.7% |
| EUR | 12,621 | 20.1% |
| GBP | 8,140 | 12.9% |
| CAD | 5,415 | 8.6% |
| AUD | 2,941 | 4.7% |

## Channel Split

- **Online (StoreKey 0)**: 13,165 line items (20.9%)
- **Physical stores**: 49,719 line items (79.1%)
