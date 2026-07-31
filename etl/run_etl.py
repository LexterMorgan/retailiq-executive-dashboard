#!/usr/bin/env python3
"""Run the full ETL pipeline: read raw CSVs, clean, and export processed files."""

from __future__ import annotations

import sys
from pathlib import Path

# Allow running as `python etl/run_etl.py` from project root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from etl.config import PROCESSED_FILES, RAW_FILES
from etl.io_utils import read_raw_csv, write_processed
from etl.transform import (
    build_dim_date,
    clean_customers,
    clean_exchange_rates,
    clean_products,
    clean_sales,
    clean_stores,
)


def main() -> None:
    print("Reading raw data...")
    raw_customers = read_raw_csv(RAW_FILES["customers"])
    raw_products = read_raw_csv(RAW_FILES["products"])
    raw_stores = read_raw_csv(RAW_FILES["stores"])
    raw_rates = read_raw_csv(RAW_FILES["exchange_rates"])
    raw_sales = read_raw_csv(RAW_FILES["sales"])

    print("Cleaning tables...")
    customers = clean_customers(raw_customers)
    products = clean_products(raw_products)
    stores = clean_stores(raw_stores)
    exchange_rates = clean_exchange_rates(raw_rates)
    sales = clean_sales(raw_sales)
    dim_date = build_dim_date(sales, exchange_rates)

    datasets = {
        "customers": customers,
        "products": products,
        "stores": stores,
        "exchange_rates": exchange_rates,
        "sales": sales,
        "dim_date": dim_date,
    }

    print("Writing processed files...")
    for name, df in datasets.items():
        write_processed(df, PROCESSED_FILES[name])
        print(f"  {PROCESSED_FILES[name]}: {len(df):,} rows")

    print("ETL complete.")


if __name__ == "__main__":
    main()
