import type {
  DashboardData,
  DashboardFilters,
  FilterOptions,
} from "../types/dashboard";

function buildQuery(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.year) params.set("year", String(filters.year));
  if (filters.country) params.set("country", filters.country);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  return fetchJson<FilterOptions>("/api/filters");
}

export async function fetchDashboardData(
  filters: DashboardFilters,
): Promise<DashboardData> {
  return fetchJson<DashboardData>(`/api/dashboard${buildQuery(filters)}`);
}
