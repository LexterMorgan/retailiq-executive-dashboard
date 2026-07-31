"""I/O utilities for reading and writing CSV files."""

from __future__ import annotations

import chardet
import pandas as pd

from etl.config import PROCESSED_DIR, RAW_DIR


def detect_encoding(file_path: str | bytes) -> str:
    """Detect CSV encoding from a sample of the file."""
    path = str(file_path)
    with open(path, "rb") as handle:
        sample = handle.read(65536)

    # Prefer UTF-8 when valid; fall back to chardet and common legacy encodings
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            sample.decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue

    result = chardet.detect(sample)
    return result.get("encoding") or "latin-1"


def read_raw_csv(filename: str) -> pd.DataFrame:
    """Read a raw CSV, trying common encodings until one succeeds."""
    path = RAW_DIR / filename
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            return pd.read_csv(path, encoding=encoding, low_memory=False)
        except UnicodeDecodeError:
            continue
    encoding = detect_encoding(path)
    return pd.read_csv(path, encoding=encoding, low_memory=False)


def write_processed(df: pd.DataFrame, filename: str) -> None:
    """Write a cleaned DataFrame to the processed directory."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(PROCESSED_DIR / filename, index=False)
