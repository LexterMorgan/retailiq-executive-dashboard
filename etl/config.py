"""ETL configuration paths and constants."""

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

RAW_FILES = {
    "sales": "Sales.csv",
    "customers": "Customers.csv",
    "products": "Products.csv",
    "stores": "Stores.csv",
    "exchange_rates": "Exchange_Rates.csv",
}

PROCESSED_FILES = {
    "sales": "sales.csv",
    "customers": "customers.csv",
    "products": "products.csv",
    "stores": "stores.csv",
    "exchange_rates": "exchange_rates.csv",
    "dim_date": "dim_date.csv",
}

DATE_FORMAT = "%Y-%m-%d"
