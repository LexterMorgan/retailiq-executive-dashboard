-- =============================================================================
-- RetailIQ Executive Dashboard — Analytical Queries
-- =============================================================================
-- Purpose: Production-ready SQL that powers the RetailIQ Executive Dashboard.
-- Schema:  retailiq (run after sql/schema.sql and sql/import.sql)
--
-- Usage:   psql -d retailiq -f analysis/executive_analysis.sql
--          Or copy individual queries into Metabase, Superset, Power BI, or Tableau.
-- =============================================================================

SET search_path TO retailiq, public;


-- =============================================================================
-- 1. EXECUTIVE KPIs
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1.1 Executive KPI Scorecard
-- -----------------------------------------------------------------------------
-- Business question: What is the overall scale and efficiency of the business?
-- Why it matters:   Executives need a single snapshot of revenue, volume, reach,
--                   and basket size to assess health before drilling into trends.
-- Dashboard:        Executive Overview — KPI scorecard (big-number cards)
--                   Fields: Total Revenue | Total Orders | Total Customers | AOV
-- -----------------------------------------------------------------------------

SELECT
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS total_revenue_usd,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    COUNT(DISTINCT s.customer_key)                                      AS total_customers,
    ROUND(
        SUM(s.quantity * p.unit_price_usd)
            / NULLIF(COUNT(DISTINCT s.order_number), 0),
        2
    )                                                                   AS avg_order_value_usd
FROM fact_sales s
JOIN dim_product p
    ON s.product_key = p.product_key;


-- =============================================================================
-- 2. SALES PERFORMANCE
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 2.1 Monthly Revenue Trend
-- -----------------------------------------------------------------------------
-- Business question: How is revenue growing or declining over time?
-- Why it matters:   Monthly trends reveal seasonality, momentum, and the impact
--                   of campaigns or market shifts — the primary input for forecasting.
-- Dashboard:        Executive Overview & Sales Performance — revenue trend line chart
--                   X-axis: year-month | Y-axis: revenue_usd
-- -----------------------------------------------------------------------------

SELECT
    d.year,
    d.month,
    d.month_name,
    TO_CHAR(MAKE_DATE(d.year, d.month, 1), 'YYYY-MM')                  AS year_month,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    COUNT(DISTINCT s.order_number)                                      AS total_orders
FROM fact_sales s
JOIN dim_date d
    ON s.order_date = d.date_key
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    d.year,
    d.month,
    d.month_name
ORDER BY
    d.year,
    d.month;


-- -----------------------------------------------------------------------------
-- 2.2 Top 10 Products by Revenue
-- -----------------------------------------------------------------------------
-- Business question: Which individual products drive the most revenue?
-- Why it matters:   Identifies hero SKUs for inventory, marketing, and supply-chain
--                   prioritization; highlights concentration risk in the product mix.
-- Dashboard:        Product Analytics — top products table / horizontal bar chart
--                   Fields: product_name, brand, category, units_sold, revenue_usd
-- -----------------------------------------------------------------------------

SELECT
    p.product_key,
    p.product_name,
    p.brand,
    p.category,
    SUM(s.quantity)                                                     AS units_sold,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)    AS profit_usd
FROM fact_sales s
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    p.product_key,
    p.product_name,
    p.brand,
    p.category
ORDER BY
    revenue_usd DESC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 2.3 Top 10 Stores by Revenue
-- -----------------------------------------------------------------------------
-- Business question: Which store locations generate the highest revenue?
-- Why it matters:   Surfaces top-performing locations for benchmarking, expansion
--                   decisions, and underperforming stores that need intervention.
-- Dashboard:        Store & Channel — store ranking bar chart / detail table
--                   Fields: store_key, country, state, is_online, revenue_usd
-- -----------------------------------------------------------------------------

SELECT
    st.store_key,
    st.country                                                          AS store_country,
    st.state                                                            AS store_state,
    st.is_online,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    SUM(s.quantity)                                                     AS units_sold,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)    AS profit_usd
FROM fact_sales s
JOIN dim_store st
    ON s.store_key = st.store_key
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    st.store_key,
    st.country,
    st.state,
    st.is_online
ORDER BY
    revenue_usd DESC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 2.4 Revenue by Country
-- -----------------------------------------------------------------------------
-- Business question: Which countries contribute the most revenue?
-- Why it matters:   Guides geographic investment, localization, and market-entry
--                   strategy; reveals regional dependence and growth opportunities.
-- Dashboard:        Store & Channel — revenue by country choropleth / bar chart
--                   Fields: country, revenue_usd, revenue_share_pct
-- -----------------------------------------------------------------------------

SELECT
    st.country                                                          AS country,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    SUM(s.quantity)                                                     AS units_sold,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    ROUND(
        100.0 * SUM(s.quantity * p.unit_price_usd)
            / SUM(SUM(s.quantity * p.unit_price_usd)) OVER (),
        2
    )                                                                   AS revenue_share_pct
FROM fact_sales s
JOIN dim_store st
    ON s.store_key = st.store_key
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    st.country
ORDER BY
    revenue_usd DESC;


-- =============================================================================
-- 3. CUSTOMER INSIGHTS
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 3.1 Top Customers by Revenue
-- -----------------------------------------------------------------------------
-- Business question: Who are the highest-value customers?
-- Why it matters:   Supports VIP retention, loyalty programs, and personalized
--                   outreach; quantifies revenue concentration among key accounts.
-- Dashboard:        Customer Insights — top customers table / ranked bar chart
--                   Fields: customer_name, country, total_orders, total_revenue_usd
-- -----------------------------------------------------------------------------

SELECT
    c.customer_key,
    c.name                                                              AS customer_name,
    c.country                                                           AS customer_country,
    c.continent,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    SUM(s.quantity)                                                     AS units_purchased,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS total_revenue_usd,
    ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)    AS total_profit_usd
FROM dim_customer c
JOIN fact_sales s
    ON c.customer_key = s.customer_key
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    c.customer_key,
    c.name,
    c.country,
    c.continent
ORDER BY
    total_revenue_usd DESC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 3.2 Average Spend per Customer
-- -----------------------------------------------------------------------------
-- Business question: What is the typical lifetime value of a purchasing customer?
-- Why it matters:   Average spend per customer benchmarks acquisition cost tolerance,
--                   loyalty program ROI, and overall customer monetization efficiency.
-- Dashboard:        Customer Insights — KPI card (avg spend) + LTV histogram context
--                   Field: avg_spend_per_customer_usd
-- -----------------------------------------------------------------------------

SELECT
    ROUND(AVG(customer_totals.total_revenue_usd), 2)                    AS avg_spend_per_customer_usd,
    COUNT(*)                                                            AS customers_with_purchases,
    ROUND(SUM(customer_totals.total_revenue_usd), 2)                    AS total_revenue_usd
FROM (
    SELECT
        s.customer_key,
        SUM(s.quantity * p.unit_price_usd)                              AS total_revenue_usd
    FROM fact_sales s
    JOIN dim_product p
        ON s.product_key = p.product_key
    GROUP BY
        s.customer_key
) AS customer_totals;


-- =============================================================================
-- 4. PRODUCT INSIGHTS
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 4.1 Best Performing Categories
-- -----------------------------------------------------------------------------
-- Business question: Which product categories generate the most revenue and profit?
-- Why it matters:   Drives assortment planning, merchandising, and capital allocation
--                   across the portfolio; highlights category mix shifts over time.
-- Dashboard:        Product Analytics — category treemap / ranked bar chart
--                   Fields: category, revenue_usd, profit_usd, units_sold
-- -----------------------------------------------------------------------------

SELECT
    p.category,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    SUM(s.quantity)                                                     AS units_sold,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)    AS profit_usd,
    ROUND(
        100.0 * SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd))
            / NULLIF(SUM(s.quantity * p.unit_price_usd), 0),
        2
    )                                                                   AS profit_margin_pct,
    ROUND(
        100.0 * SUM(s.quantity * p.unit_price_usd)
            / SUM(SUM(s.quantity * p.unit_price_usd)) OVER (),
        2
    )                                                                   AS revenue_share_pct
FROM fact_sales s
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    p.category
ORDER BY
    revenue_usd DESC;


-- -----------------------------------------------------------------------------
-- 4.2 Best Performing Brands
-- -----------------------------------------------------------------------------
-- Business question: Which brands deliver the strongest commercial performance?
-- Why it matters:   Informs vendor negotiations, co-marketing partnerships, and shelf
--                   space decisions; reveals brand-level margin differences.
-- Dashboard:        Product Analytics — brand ranking horizontal bar chart
--                   Fields: brand, revenue_usd, profit_usd, units_sold
-- -----------------------------------------------------------------------------

SELECT
    p.brand,
    COUNT(DISTINCT s.order_number)                                      AS total_orders,
    SUM(s.quantity)                                                     AS units_sold,
    ROUND(SUM(s.quantity * p.unit_price_usd), 2)                        AS revenue_usd,
    ROUND(SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd)), 2)    AS profit_usd,
    ROUND(
        100.0 * SUM(s.quantity * (p.unit_price_usd - p.unit_cost_usd))
            / NULLIF(SUM(s.quantity * p.unit_price_usd), 0),
        2
    )                                                                   AS profit_margin_pct
FROM fact_sales s
JOIN dim_product p
    ON s.product_key = p.product_key
GROUP BY
    p.brand
ORDER BY
    revenue_usd DESC;
