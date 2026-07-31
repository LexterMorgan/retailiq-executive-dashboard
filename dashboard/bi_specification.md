# Business Intelligence Specification

Retail sales analytics for the Contoso-style global retail dataset (2016–2021).

---

## Executive KPIs

| KPI | Definition | Source |
|-----|------------|--------|
| **Total Revenue (USD)** | Sum of quantity × unit price across all line items | `vw_sales_detail.revenue_usd` |
| **Total Profit (USD)** | Sum of quantity × (unit price − unit cost) | `vw_sales_detail.profit_usd` |
| **Profit Margin %** | Total profit ÷ total revenue × 100 | `vw_monthly_kpis.profit_margin_pct` |
| **Total Orders** | Count of distinct order numbers | `fact_sales.order_number` |
| **Units Sold** | Sum of quantity | `fact_sales.quantity` |
| **Average Order Value (USD)** | Total revenue ÷ distinct orders | Derived |
| **Unique Customers** | Count of distinct customers with orders | `fact_sales.customer_key` |
| **Online vs Store Revenue Split** | Revenue by `dim_store.is_online` | `vw_store_performance` |
| **Delivery Completion Rate** | % of line items with a delivery date | `vw_delivery_performance` |
| **Average Delivery Time (days)** | Mean days between order and delivery | `vw_sales_detail.delivery_days` |

---

## Business Metrics

### Revenue & Profitability
- Revenue by month, quarter, and year
- Profit margin by category, brand, and store
- Revenue per square meter (physical stores only)
- Average line-item revenue and profit

### Customer
- Customer count by country, continent, and gender
- Customer lifetime value (total revenue per customer)
- Repeat purchase rate (% of customers with >1 order)
- Average customer age at time of purchase

### Product
- Top products by revenue and units sold
- Category and subcategory mix
- Brand performance ranking
- Average selling price by category

### Store & Channel
- Store revenue ranking
- Online vs in-store channel comparison
- New store performance (post open date)
- Geographic revenue distribution

### Operations
- Delivery lead time trends
- Orders missing delivery dates (backlog indicator)
- Currency exposure (revenue share by currency)

---

## 20 Business Questions

1. What is total revenue and profit for the current year vs prior year?
2. Which product category generates the highest profit margin?
3. Which store has the highest revenue per square meter?
4. How does online revenue compare to in-store revenue over time?
5. What are the top 10 best-selling products by units and by revenue?
6. Which countries contribute the most revenue?
7. What is the monthly trend in order volume and average order value?
8. Which customer segment (gender, continent) has the highest lifetime value?
9. What percentage of orders have not yet been delivered?
10. What is the average delivery time by store country?
11. Which brands drive the most profit?
12. How does sales seasonality vary by product category?
13. What is the currency mix of transactions and associated FX exposure?
14. Which subcategories are underperforming relative to their category average?
15. How many customers made repeat purchases, and what is their share of revenue?
16. What is the profit margin trend by quarter?
17. Which stores opened after 2015 are ramping fastest?
18. What is the average basket size (units per order)?
19. How does customer age distribution relate to product category preference?
20. Which day of the week has the highest order volume?

---

## Recommended Dashboard Pages

### 1. Executive Overview
High-level KPI cards, revenue & profit trend line, top categories bar chart, online vs store donut.

### 2. Sales Performance
Monthly/quarterly revenue, order volume, AOV trend, year-over-year comparison table.

### 3. Product Analytics
Category treemap, brand ranking bar chart, top products table, margin by category.

### 4. Store & Channel
Store map or bar by country, revenue per sqm scatter, online vs store time series, store detail table.

### 5. Customer Insights
Customer count by geography, gender split, LTV histogram, repeat vs one-time customers.

### 6. Operations & Delivery
Delivery completion gauge, avg delivery days trend, pending deliveries count, lead time by store.

---

## Recommended Visualizations

| Page | Visualization | Chart Type | Fields |
|------|---------------|------------|--------|
| Executive | Revenue & Profit Trend | Dual-axis line | Month, Revenue USD, Profit USD |
| Executive | KPI Scorecard | Card / Big Number | Total Revenue, Margin %, Orders, Customers |
| Executive | Revenue by Channel | Donut | is_online, revenue_usd |
| Sales | Monthly Orders | Area chart | Month, order count |
| Sales | YoY Revenue | Clustered bar | Year, Month, revenue |
| Product | Category Mix | Treemap | category, revenue_usd |
| Product | Brand Ranking | Horizontal bar | brand, profit_usd |
| Product | Top 10 Products | Table | product_name, units, revenue, margin |
| Store | Revenue by Country | Choropleth / bar | store country, revenue |
| Store | Revenue per SQM | Scatter | store, sqm, revenue |
| Customer | Customers by Continent | Stacked bar | continent, gender |
| Customer | LTV Distribution | Histogram | customer total revenue |
| Operations | Delivery Days | Box plot | store country, delivery_days |
| Operations | Completion Rate | Gauge | delivery_completion_pct |

---

## Suggested Tooling

- **PostgreSQL** — data warehouse (`sql/schema.sql`, `sql/views.sql`)
- **Metabase / Superset / Power BI / Tableau** — connect to `vw_sales_detail` and KPI views
- **Python ETL** — refresh processed CSVs via `python etl/run_etl.py`
