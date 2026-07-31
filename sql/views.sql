-- RetailIQ Executive Dashboard - Analytical Views
SET search_path TO retailiq, public;

-- ---------------------------------------------------------------------------
-- Sales enriched with product pricing and USD conversion
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_sales_detail AS
SELECT
    s.order_number,
    s.line_item,
    s.order_date,
    s.delivery_date,
    s.customer_key,
    s.store_key,
    s.product_key,
    s.quantity,
    s.currency_code,
    p.product_name,
    p.brand,
    p.category,
    p.subcategory,
    p.unit_cost_usd,
    p.unit_price_usd,
    (s.quantity * p.unit_price_usd) AS revenue_usd,
    (s.quantity * p.unit_cost_usd) AS cost_usd,
    (s.quantity * (p.unit_price_usd - p.unit_cost_usd)) AS profit_usd,
    COALESCE(er.exchange_rate, 1.0) AS exchange_rate,
    CASE
        WHEN s.currency_code = 'USD' THEN s.quantity * p.unit_price_usd
        WHEN er.exchange_rate IS NOT NULL AND er.exchange_rate <> 0
            THEN (s.quantity * p.unit_price_usd) / er.exchange_rate
        ELSE NULL
    END AS revenue_local,
    CASE
        WHEN s.delivery_date IS NULL THEN NULL
        ELSE s.delivery_date - s.order_date
    END AS delivery_days
FROM fact_sales s
JOIN dim_product p ON s.product_key = p.product_key
LEFT JOIN fact_exchange_rate er
    ON s.order_date = er.rate_date
    AND s.currency_code = er.currency;

-- ---------------------------------------------------------------------------
-- Monthly executive KPIs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_monthly_kpis AS
SELECT
    d.year,
    d.month,
    d.month_name,
    COUNT(DISTINCT s.order_number) AS total_orders,
    COUNT(*) AS total_line_items,
    SUM(s.quantity) AS total_units_sold,
    SUM(v.revenue_usd) AS total_revenue_usd,
    SUM(v.cost_usd) AS total_cost_usd,
    SUM(v.profit_usd) AS total_profit_usd,
    ROUND(
        100.0 * SUM(v.profit_usd) / NULLIF(SUM(v.revenue_usd), 0),
        2
    ) AS profit_margin_pct,
    COUNT(DISTINCT s.customer_key) AS unique_customers,
    ROUND(AVG(v.revenue_usd), 2) AS avg_line_revenue_usd
FROM fact_sales s
JOIN dim_date d ON s.order_date = d.date_key
JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY d.year, d.month, d.month_name
ORDER BY d.year, d.month;

-- ---------------------------------------------------------------------------
-- Store performance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_store_performance AS
SELECT
    st.store_key,
    st.country AS store_country,
    st.state AS store_state,
    st.is_online,
    st.square_meters,
    COUNT(DISTINCT s.order_number) AS total_orders,
    SUM(s.quantity) AS total_units,
    SUM(v.revenue_usd) AS total_revenue_usd,
    SUM(v.profit_usd) AS total_profit_usd,
    ROUND(
        SUM(v.revenue_usd) / NULLIF(st.square_meters, 0),
        2
    ) AS revenue_per_sqm_usd
FROM fact_sales s
JOIN dim_store st ON s.store_key = st.store_key
JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY
    st.store_key,
    st.country,
    st.state,
    st.is_online,
    st.square_meters
ORDER BY total_revenue_usd DESC;

-- ---------------------------------------------------------------------------
-- Product category performance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_category_performance AS
SELECT
    p.category,
    p.subcategory,
    COUNT(DISTINCT s.order_number) AS total_orders,
    SUM(s.quantity) AS total_units,
    SUM(v.revenue_usd) AS total_revenue_usd,
    SUM(v.profit_usd) AS total_profit_usd,
    ROUND(AVG(p.unit_price_usd), 2) AS avg_unit_price_usd
FROM fact_sales s
JOIN dim_product p ON s.product_key = p.product_key
JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY p.category, p.subcategory
ORDER BY total_revenue_usd DESC;

-- ---------------------------------------------------------------------------
-- Customer segmentation summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_customer_summary AS
SELECT
    c.customer_key,
    c.gender,
    c.country,
    c.continent,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.birthday))::INTEGER AS age,
    COUNT(DISTINCT s.order_number) AS total_orders,
    SUM(s.quantity) AS total_units,
    SUM(v.revenue_usd) AS total_revenue_usd,
    SUM(v.profit_usd) AS total_profit_usd,
    MIN(s.order_date) AS first_order_date,
    MAX(s.order_date) AS last_order_date
FROM dim_customer c
JOIN fact_sales s ON c.customer_key = s.customer_key
JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY
    c.customer_key,
    c.gender,
    c.country,
    c.continent,
    c.birthday;

-- ---------------------------------------------------------------------------
-- Delivery performance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_delivery_performance AS
SELECT
    d.year,
    d.quarter,
    COUNT(*) AS total_line_items,
    COUNT(s.delivery_date) AS delivered_line_items,
    ROUND(
        100.0 * COUNT(s.delivery_date) / NULLIF(COUNT(*), 0),
        2
    ) AS delivery_completion_pct,
    ROUND(AVG(v.delivery_days), 1) AS avg_delivery_days
FROM fact_sales s
JOIN dim_date d ON s.order_date = d.date_key
LEFT JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY d.year, d.quarter
ORDER BY d.year, d.quarter;

-- ---------------------------------------------------------------------------
-- Currency mix
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_currency_mix AS
SELECT
    s.currency_code,
    COUNT(DISTINCT s.order_number) AS total_orders,
    SUM(v.revenue_usd) AS total_revenue_usd,
    ROUND(
        100.0 * SUM(v.revenue_usd) / SUM(SUM(v.revenue_usd)) OVER (),
        2
    ) AS revenue_share_pct
FROM fact_sales s
JOIN vw_sales_detail v
    ON s.order_number = v.order_number
    AND s.line_item = v.line_item
GROUP BY s.currency_code
ORDER BY total_revenue_usd DESC;
