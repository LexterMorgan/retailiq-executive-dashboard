# Data Dictionary

Source: `data/raw/Data_Dictionary.csv` plus ETL naming conventions.

## Source Tables

### Sales (Fact)
| Raw Column | Processed Column | Type | Description |
|------------|------------------|------|-------------|
| Order Number | order_number | INTEGER | Order identifier (part of composite PK) |
| Line Item | line_item | INTEGER | Line item within order (part of composite PK) |
| Order Date | order_date | DATE | Date order was placed |
| Delivery Date | delivery_date | DATE | Date order was delivered (nullable) |
| CustomerKey | customer_key | INTEGER | FK → dim_customer |
| StoreKey | store_key | INTEGER | FK → dim_store (0 = Online) |
| ProductKey | product_key | INTEGER | FK → dim_product |
| Quantity | quantity | INTEGER | Units purchased |
| Currency Code | currency_code | CHAR(3) | Transaction currency |

### Customers (Dimension)
| Raw Column | Processed Column | Type | Description |
|------------|------------------|------|-------------|
| CustomerKey | customer_key | INTEGER | Primary key |
| Gender | gender | VARCHAR | Customer gender |
| Name | name | VARCHAR | Full name |
| City | city | VARCHAR | City |
| State Code | state_code | VARCHAR | State abbreviation |
| State | state | VARCHAR | Full state name |
| Zip Code | zip_code | VARCHAR | Postal code |
| Country | country | VARCHAR | Country |
| Continent | continent | VARCHAR | Continent |
| Birthday | birthday | DATE | Date of birth |

### Products (Dimension)
| Raw Column | Processed Column | Type | Description |
|------------|------------------|------|-------------|
| ProductKey | product_key | INTEGER | Primary key |
| Product Name | product_name | VARCHAR | Product name |
| Brand | brand | VARCHAR | Brand name |
| Color | color | VARCHAR | Product color |
| Unit Cost USD | unit_cost_usd | NUMERIC | Cost in USD |
| Unit Price USD | unit_price_usd | NUMERIC | List price in USD |
| SubcategoryKey | subcategory_key | INTEGER | Subcategory identifier |
| Subcategory | subcategory | VARCHAR | Subcategory name |
| CategoryKey | category_key | INTEGER | Category identifier |
| Category | category | VARCHAR | Category name |

### Stores (Dimension)
| Raw Column | Processed Column | Type | Description |
|------------|------------------|------|-------------|
| StoreKey | store_key | INTEGER | Primary key (0 = Online) |
| Country | country | VARCHAR | Store country |
| State | state | VARCHAR | Store state/region |
| Square Meters | square_meters | NUMERIC | Store footprint (NULL for online) |
| Open Date | open_date | DATE | Store opening date |

### Exchange Rates (Fact)
| Raw Column | Processed Column | Type | Description |
|------------|------------------|------|-------------|
| Date | rate_date | DATE | Rate date |
| Currency | currency | CHAR(3) | Currency code |
| Exchange | exchange_rate | NUMERIC | Rate vs USD |

## Derived: dim_date
Generated during ETL from all dates in sales and exchange rates.

| Column | Type | Description |
|--------|------|-------------|
| date_key | DATE | Primary key |
| year | SMALLINT | Calendar year |
| quarter | SMALLINT | Quarter (1–4) |
| month | SMALLINT | Month (1–12) |
| month_name | VARCHAR | Full month name |
| day_of_month | SMALLINT | Day of month |
| day_of_week | SMALLINT | 0=Monday … 6=Sunday |
| day_name | VARCHAR | Weekday name |
| week_of_year | SMALLINT | ISO week number |
| is_weekend | BOOLEAN | Saturday or Sunday |
