export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    notation: compact && value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function truncateLabel(label: string, max = 28): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function storeLabel(store: {
  store_key: number;
  store_country: string;
  store_state: string;
  is_online: boolean;
}): string {
  if (store.is_online) return "Online Channel";
  return `${store.store_state}, ${store.store_country}`;
}
