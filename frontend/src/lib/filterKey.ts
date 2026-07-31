import type { DashboardFilters } from "../types/dashboard";

/**
 * Build a cache key matching Express API query strings and static snapshot keys.
 * Parameter order: year → country → category.
 */
export function filtersToKey(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.year) params.set("year", String(filters.year));
  if (filters.country) params.set("country", filters.country);
  if (filters.category) params.set("category", filters.category);
  return params.toString();
}
