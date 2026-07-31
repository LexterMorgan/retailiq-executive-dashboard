-- RetailIQ Executive Dashboard - PostgreSQL Schema
-- Star schema for retail sales analytics (Contoso-style dataset)

CREATE SCHEMA IF NOT EXISTS retailiq;
SET search_path TO retailiq, public;

-- ---------------------------------------------------------------------------
-- Dimension: Date
-- ---------------------------------------------------------------------------
CREATE TABLE dim_date (
    date_key        DATE PRIMARY KEY,
    year            SMALLINT NOT NULL,
    quarter         SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    month           SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    month_name      VARCHAR(20) NOT NULL,
    day_of_month    SMALLINT NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    day_name        VARCHAR(20) NOT NULL,
    week_of_year    SMALLINT NOT NULL,
    is_weekend      BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------------
-- Dimension: Customer
-- ---------------------------------------------------------------------------
CREATE TABLE dim_customer (
    customer_key    INTEGER PRIMARY KEY,
    gender          VARCHAR(20) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(255) NOT NULL,
    state_code      VARCHAR(255) NOT NULL,
    state           VARCHAR(255) NOT NULL,
    zip_code        VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    continent       VARCHAR(50) NOT NULL,
    birthday        DATE
);

CREATE INDEX idx_dim_customer_country ON dim_customer (country);
CREATE INDEX idx_dim_customer_continent ON dim_customer (continent);

-- ---------------------------------------------------------------------------
-- Dimension: Product (denormalized category hierarchy)
-- ---------------------------------------------------------------------------
CREATE TABLE dim_product (
    product_key         INTEGER PRIMARY KEY,
    product_name        VARCHAR(500) NOT NULL,
    brand               VARCHAR(100) NOT NULL,
    color               VARCHAR(50) NOT NULL,
    unit_cost_usd       NUMERIC(12, 2) NOT NULL CHECK (unit_cost_usd >= 0),
    unit_price_usd      NUMERIC(12, 2) NOT NULL CHECK (unit_price_usd >= 0),
    subcategory_key     INTEGER NOT NULL,
    subcategory         VARCHAR(100) NOT NULL,
    category_key        INTEGER NOT NULL,
    category            VARCHAR(100) NOT NULL
);

CREATE INDEX idx_dim_product_category ON dim_product (category);
CREATE INDEX idx_dim_product_brand ON dim_product (brand);
CREATE INDEX idx_dim_product_subcategory ON dim_product (subcategory);

-- ---------------------------------------------------------------------------
-- Dimension: Store
-- ---------------------------------------------------------------------------
CREATE TABLE dim_store (
    store_key       INTEGER PRIMARY KEY,
    country         VARCHAR(100) NOT NULL,
    state           VARCHAR(255) NOT NULL,
    square_meters   NUMERIC(10, 2) CHECK (square_meters IS NULL OR square_meters >= 0),
    open_date       DATE NOT NULL,
    is_online       BOOLEAN GENERATED ALWAYS AS (store_key = 0) STORED
);

CREATE INDEX idx_dim_store_country ON dim_store (country);

-- ---------------------------------------------------------------------------
-- Fact: Exchange Rates (daily currency rates vs USD)
-- ---------------------------------------------------------------------------
CREATE TABLE fact_exchange_rate (
    rate_date       DATE NOT NULL,
    currency        CHAR(3) NOT NULL,
    exchange_rate   NUMERIC(12, 6) NOT NULL CHECK (exchange_rate > 0),
    PRIMARY KEY (rate_date, currency),
    CONSTRAINT fk_exchange_rate_date
        FOREIGN KEY (rate_date) REFERENCES dim_date (date_key)
);

CREATE INDEX idx_fact_exchange_rate_currency ON fact_exchange_rate (currency);

-- ---------------------------------------------------------------------------
-- Fact: Sales (grain = order line item)
-- ---------------------------------------------------------------------------
CREATE TABLE fact_sales (
    order_number        INTEGER NOT NULL,
    line_item           INTEGER NOT NULL,
    order_date          DATE NOT NULL,
    delivery_date       DATE,
    customer_key        INTEGER NOT NULL,
    store_key           INTEGER NOT NULL,
    product_key         INTEGER NOT NULL,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    currency_code       CHAR(3) NOT NULL,
    PRIMARY KEY (order_number, line_item),
    CONSTRAINT fk_sales_order_date
        FOREIGN KEY (order_date) REFERENCES dim_date (date_key),
    CONSTRAINT fk_sales_delivery_date
        FOREIGN KEY (delivery_date) REFERENCES dim_date (date_key),
    CONSTRAINT fk_sales_customer
        FOREIGN KEY (customer_key) REFERENCES dim_customer (customer_key),
    CONSTRAINT fk_sales_store
        FOREIGN KEY (store_key) REFERENCES dim_store (store_key),
    CONSTRAINT fk_sales_product
        FOREIGN KEY (product_key) REFERENCES dim_product (product_key)
);

CREATE INDEX idx_fact_sales_order_date ON fact_sales (order_date);
CREATE INDEX idx_fact_sales_customer ON fact_sales (customer_key);
CREATE INDEX idx_fact_sales_store ON fact_sales (store_key);
CREATE INDEX idx_fact_sales_product ON fact_sales (product_key);
CREATE INDEX idx_fact_sales_currency ON fact_sales (currency_code);
