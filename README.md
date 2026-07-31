# RetailIQ Executive Dashboard

A end-to-end Business Intelligence portfolio project for global retail sales analytics. Transforms raw Contoso-style retail CSV exports into a PostgreSQL star schema ready for executive dashboards and ad-hoc analysis.

## Project Overview

This project demonstrates core BI engineering skills:

- **Data profiling** and quality assessment
- **Python ETL** with Pandas (encoding detection, cleaning, normalization)
- **Dimensional modeling** (star schema with fact and dimension tables)
- **PostgreSQL** warehouse with constraints, indexes, and analytical views
- **Dashboard design** with KPIs, business questions, and visualization recommendations

## Dataset

Raw source files live in `data/raw/`:

| File | Purpose | Rows |
|------|---------|------|
| `Sales.csv` | Order line items (fact) | ~63K |
| `Customers.csv` | Customer demographics | ~15K |
| `Products.csv` | Product catalog with pricing | ~2.5K |
| `Stores.csv` | Physical and online store locations | 67 |
| `Exchange_Rates.csv` | Daily FX rates vs USD | ~11K |

See [docs/data_dictionary.md](docs/data_dictionary.md) for field-level documentation and [docs/data_quality_report.md](docs/data_quality_report.md) for known data issues.

## Architecture

```
data/raw/          →  etl/ (Pandas)  →  data/processed/  →  sql/ (PostgreSQL)  →  Dashboard
```

```
                    dim_date
                        │
    dim_customer ── fact_sales ── dim_product
                        │
                    dim_store

              fact_exchange_rate → dim_date
```

Full schema rationale: [docs/star_schema.md](docs/star_schema.md)

## Quick Start

### 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run ETL

```bash
python etl/run_etl.py
```

Outputs cleaned CSVs to `data/processed/`:

- `sales.csv`, `customers.csv`, `products.csv`, `stores.csv`
- `exchange_rates.csv`, `dim_date.csv`

### 3. Load PostgreSQL

```bash
createdb retailiq
psql -d retailiq -f sql/schema.sql
psql -d retailiq -f sql/import.sql
psql -d retailiq -f sql/views.sql
```

Adjust paths in `sql/import.sql` if running from a different working directory.

### 4. Connect a BI tool

Point Metabase, Superset, Power BI, or Tableau at the `retailiq` schema. Primary views:

- `vw_sales_detail` — enriched line-item facts with revenue/profit in USD
- `vw_monthly_kpis` — monthly executive metrics
- `vw_store_performance` — store and channel rankings
- `vw_category_performance` — product hierarchy metrics

## ETL Process

The pipeline in `etl/` follows a simple, maintainable structure:

| Module | Role |
|--------|------|
| `config.py` | Paths and constants |
| `io_utils.py` | Encoding detection, CSV read/write |
| `transform.py` | Per-table cleaning functions |
| `run_etl.py` | Orchestrates the full pipeline |

**Cleaning applied:**

- Automatic CSV encoding detection (UTF-8 / Latin-1)
- Column renaming to snake_case
- Date parsing (M/D/YYYY → ISO 8601)
- Currency string parsing (`$12.99` → `12.99`)
- Duplicate removal on primary keys
- Missing state codes filled with `UNK`
- Invalid sales rows removed (null dates, zero quantity)
- Date dimension generated from all relevant dates

Raw files in `data/raw/` are never modified.

## Database Design

PostgreSQL schema in `sql/schema.sql`:

- **Facts**: `fact_sales`, `fact_exchange_rate`
- **Dimensions**: `dim_customer`, `dim_product`, `dim_store`, `dim_date`
- Primary keys, foreign keys, check constraints, and indexes
- Analytical views in `sql/views.sql`

## Business Objectives

Support executive and operational decisions across:

1. **Revenue & profitability** — track growth, margins, and category mix
2. **Channel strategy** — compare online vs in-store performance
3. **Store operations** — rank locations by revenue and efficiency (revenue/sqm)
4. **Customer insight** — segment by geography, demographics, and lifetime value
5. **Fulfillment** — monitor delivery completion and lead times

Full KPI definitions, 20 business questions, and dashboard wireframes: [dashboard/bi_specification.md](dashboard/bi_specification.md)

## Dashboard Overview

Recommended pages:

| Page | Focus |
|------|-------|
| Executive Overview | KPI cards, revenue trend, channel split |
| Sales Performance | Monthly trends, YoY comparison |
| Product Analytics | Category treemap, brand rankings |
| Store & Channel | Geographic performance, online vs store |
| Customer Insights | Segmentation, LTV, repeat rate |
| Operations | Delivery metrics and backlog |

## Project Structure

```
retailiq-executive-dashboard/
├── data/
│   ├── raw/                 # Source CSVs (unchanged)
│   └── processed/           # ETL output
├── etl/
│   ├── config.py
│   ├── io_utils.py
│   ├── transform.py
│   └── run_etl.py
├── sql/
│   ├── schema.sql
│   ├── views.sql
│   └── import.sql
├── dashboard/
│   └── bi_specification.md
├── docs/
│   ├── data_dictionary.md
│   ├── star_schema.md
│   └── data_quality_report.md
├── requirements.txt
└── README.md
```

## License

Portfolio / educational use. Dataset structure follows common Contoso retail sample patterns.
