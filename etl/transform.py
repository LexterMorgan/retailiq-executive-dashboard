"""Data cleaning and transformation functions for each source table."""

from __future__ import annotations

import pandas as pd

from etl.config import DATE_FORMAT


def _parse_us_date(series: pd.Series) -> pd.Series:
    """Parse M/D/YYYY dates; invalid values become NaT."""
    return pd.to_datetime(series, format="%m/%d/%Y", errors="coerce")


def _parse_currency(series: pd.Series) -> pd.Series:
    """Convert '$1,234.56 ' strings to float."""
    cleaned = (
        series.astype(str)
        .str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
    )
    return pd.to_numeric(cleaned, errors="coerce")


def _normalize_text(series: pd.Series) -> pd.Series:
    """Trim whitespace and collapse internal spaces."""
    return series.astype(str).str.strip().str.replace(r"\s+", " ", regex=True)


def clean_customers(df: pd.DataFrame) -> pd.DataFrame:
    """Clean customer dimension data."""
    out = df.copy()
    out.columns = [
        "customer_key",
        "gender",
        "name",
        "city",
        "state_code",
        "state",
        "zip_code",
        "country",
        "continent",
        "birthday",
    ]

    out = out.drop_duplicates(subset=["customer_key"])
    out["gender"] = _normalize_text(out["gender"])
    out["name"] = _normalize_text(out["name"])
    out["city"] = _normalize_text(out["city"])
    out["state"] = _normalize_text(out["state"])
    out["country"] = _normalize_text(out["country"])
    out["continent"] = _normalize_text(out["continent"])
    out["zip_code"] = _normalize_text(out["zip_code"])
    out["state_code"] = out["state_code"].fillna("UNK").apply(lambda x: str(x).strip())

    out["birthday"] = _parse_us_date(out["birthday"])
    out["birthday"] = out["birthday"].dt.strftime(DATE_FORMAT)

    return out.reset_index(drop=True)


def clean_products(df: pd.DataFrame) -> pd.DataFrame:
    """Clean product dimension data."""
    out = df.copy()
    out.columns = [
        "product_key",
        "product_name",
        "brand",
        "color",
        "unit_cost_usd",
        "unit_price_usd",
        "subcategory_key",
        "subcategory",
        "category_key",
        "category",
    ]

    out = out.drop_duplicates(subset=["product_key"])
    out["product_name"] = _normalize_text(out["product_name"])
    out["brand"] = _normalize_text(out["brand"])
    out["color"] = _normalize_text(out["color"])
    out["subcategory"] = _normalize_text(out["subcategory"])
    out["category"] = _normalize_text(out["category"])
    out["unit_cost_usd"] = _parse_currency(out["unit_cost_usd"])
    out["unit_price_usd"] = _parse_currency(out["unit_price_usd"])

    return out.reset_index(drop=True)


def clean_stores(df: pd.DataFrame) -> pd.DataFrame:
    """Clean store dimension data."""
    out = df.copy()
    out.columns = ["store_key", "country", "state", "square_meters", "open_date"]

    out = out.drop_duplicates(subset=["store_key"])
    out["country"] = _normalize_text(out["country"])
    out["state"] = _normalize_text(out["state"])
    out["open_date"] = _parse_us_date(out["open_date"])
    out["open_date"] = out["open_date"].dt.strftime(DATE_FORMAT)

    # Online store (key 0) has no physical footprint
    out.loc[out["store_key"] == 0, "square_meters"] = None

    return out.reset_index(drop=True)


def clean_exchange_rates(df: pd.DataFrame) -> pd.DataFrame:
    """Clean daily exchange rate data."""
    out = df.copy()
    out.columns = ["rate_date", "currency", "exchange_rate"]

    out["rate_date"] = _parse_us_date(out["rate_date"])
    out["currency"] = _normalize_text(out["currency"]).str.upper()
    out["exchange_rate"] = pd.to_numeric(out["exchange_rate"], errors="coerce")

    out = out.dropna(subset=["rate_date", "currency", "exchange_rate"])
    out = out.drop_duplicates(subset=["rate_date", "currency"], keep="first")

    out["rate_date"] = out["rate_date"].dt.strftime(DATE_FORMAT)
    return out.reset_index(drop=True)


def clean_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Clean sales fact data."""
    out = df.copy()
    out.columns = [
        "order_number",
        "line_item",
        "order_date",
        "delivery_date",
        "customer_key",
        "store_key",
        "product_key",
        "quantity",
        "currency_code",
    ]

    out = out.drop_duplicates(subset=["order_number", "line_item"])
    out["order_date"] = _parse_us_date(out["order_date"])
    out["delivery_date"] = _parse_us_date(out["delivery_date"])
    out["currency_code"] = _normalize_text(out["currency_code"]).str.upper()
    out["quantity"] = pd.to_numeric(out["quantity"], errors="coerce").astype("Int64")

    # Remove rows with invalid keys or dates
    out = out.dropna(subset=["order_number", "line_item", "order_date", "customer_key", "product_key", "quantity"])
    out = out[out["quantity"] > 0]

    out["order_date"] = out["order_date"].dt.strftime(DATE_FORMAT)
    out["delivery_date"] = out["delivery_date"].dt.strftime(DATE_FORMAT)

    return out.reset_index(drop=True)


def build_dim_date(sales: pd.DataFrame, exchange_rates: pd.DataFrame) -> pd.DataFrame:
    """Build a date dimension covering sales and exchange rate dates."""
    sales_dates = pd.to_datetime(sales["order_date"], errors="coerce")
    delivery_dates = pd.to_datetime(sales["delivery_date"], errors="coerce")
    rate_dates = pd.to_datetime(exchange_rates["rate_date"], errors="coerce")

    all_dates = pd.concat([sales_dates, delivery_dates, rate_dates]).dropna().unique()
    dim = pd.DataFrame({"date_key": pd.to_datetime(all_dates)})
    dim = dim.sort_values("date_key").drop_duplicates().reset_index(drop=True)

    dim["date_key"] = dim["date_key"].dt.strftime(DATE_FORMAT)
    dt = pd.to_datetime(dim["date_key"])
    dim["year"] = dt.dt.year
    dim["quarter"] = dt.dt.quarter
    dim["month"] = dt.dt.month
    dim["month_name"] = dt.dt.strftime("%B")
    dim["day_of_month"] = dt.dt.day
    dim["day_of_week"] = dt.dt.dayofweek
    dim["day_name"] = dt.dt.strftime("%A")
    dim["week_of_year"] = dt.dt.isocalendar().week.astype(int)
    dim["is_weekend"] = dim["day_of_week"].isin([5, 6])

    return dim
