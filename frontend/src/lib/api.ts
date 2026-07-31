import type {
  DashboardData,
  DashboardFilters,
  FilterOptions,
} from "../types/dashboard";
import { USE_STATIC_DATA } from "./config";
import { filtersToKey } from "./filterKey";
import {
  fetchStaticDashboardData,
  fetchStaticFilterOptions,
} from "./staticData";

function buildQuery(filters: DashboardFilters): string {
  const key = filtersToKey(filters);
  return key ? `?${key}` : "";
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
  if (USE_STATIC_DATA) {
    return fetchStaticFilterOptions();
  }
  return fetchJson<FilterOptions>("/api/filters");
}

export async function fetchDashboardData(
  filters: DashboardFilters,
): Promise<DashboardData> {
  if (USE_STATIC_DATA) {
    return fetchStaticDashboardData(filters);
  }
  return fetchJson<DashboardData>(`/api/dashboard${buildQuery(filters)}`);
}
