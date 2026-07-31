# Star Schema Design

## Recommended Model

```
                    ┌─────────────┐
                    │  dim_date   │
                    └──────┬──────┘
                           │
┌─────────────┐     ┌──────▼──────┐     ┌─────────────┐
│dim_customer │────▶│  fact_sales │◀────│ dim_product │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  dim_store  │
                    └─────────────┘

┌─────────────────────┐
│ fact_exchange_rate  │──▶ dim_date
└─────────────────────┘
```

## Grain

- **fact_sales**: One row per order line item (`order_number` + `line_item`)
- **fact_exchange_rate**: One row per date + currency

## Primary Keys

| Table | Primary Key |
|-------|-------------|
| fact_sales | (order_number, line_item) |
| dim_customer | customer_key |
| dim_product | product_key |
| dim_store | store_key |
| dim_date | date_key |
| fact_exchange_rate | (rate_date, currency) |

## Foreign Keys

| From | Column | To |
|------|--------|-----|
| fact_sales | order_date | dim_date.date_key |
| fact_sales | delivery_date | dim_date.date_key |
| fact_sales | customer_key | dim_customer.customer_key |
| fact_sales | store_key | dim_store.store_key |
| fact_sales | product_key | dim_product.product_key |
| fact_exchange_rate | rate_date | dim_date.date_key |

## Design Decisions

1. **Product hierarchy denormalized** — Category and subcategory are stored on `dim_product` rather than separate dimension tables. This keeps the model simple for a portfolio project while still supporting category-level analysis.

2. **StoreKey 0 = Online channel** — The source data uses `StoreKey = 0` for online orders. A dedicated row exists in `dim_store` with country/state "Online". The `is_online` generated column simplifies channel filtering.

3. **Exchange rates as separate fact** — Rates are joined at query time on order date and currency. Product prices are already in USD; exchange rates enable local-currency revenue reporting.

4. **Degenerate dimensions retained** — `order_number` stays on the fact table rather than a separate order dimension, since order-level attributes are minimal.

5. **Date dimension pre-built in ETL** — Ensures all order, delivery, and exchange rate dates exist before loading facts, satisfying FK constraints.

## Alternative (Snowflake) Extension

For larger deployments, normalize product into:
- `dim_category` (category_key, category)
- `dim_subcategory` (subcategory_key, subcategory, category_key)
- `dim_product` (product_key, …, subcategory_key)

This project intentionally uses the simpler denormalized approach.
