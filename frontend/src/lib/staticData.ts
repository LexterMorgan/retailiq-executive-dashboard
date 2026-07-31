import type { DashboardData, FilterOptions } from "../types/dashboard";
import { ASSET_BASE } from "./config";
import { filtersToKey } from "./filterKey";

interface StaticDashboardExport {
  exportedAt: string;
  snapshots: Record<string, DashboardData>;
}

let filterOptionsCache: FilterOptions | null = null;
let staticExportCache: StaticDashboardExport | null = null;

async function fetchStaticJson<T>(relativePath: string): Promise<T> {
  const url = `${ASSET_BASE}${relativePath}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load static data (${response.status}): ${url}`,
    );
  }

  return response.json();
}

async function loadStaticExport(): Promise<StaticDashboardExport> {
  if (!staticExportCache) {
    staticExportCache = await fetchStaticJson<StaticDashboardExport>(
      "data/dashboard.json",
    );
  }
  return staticExportCache;
}

export async function fetchStaticFilterOptions(): Promise<FilterOptions> {
  if (!filterOptionsCache) {
    filterOptionsCache = await fetchStaticJson<FilterOptions>("data/filters.json");
  }
  return filterOptionsCache;
}

export async function fetchStaticDashboardData(
  filters: DashboardData["filters"],
): Promise<DashboardData> {
  const exported = await loadStaticExport();
  const key = filtersToKey(filters);
  const snapshot = exported.snapshots[key];

  if (!snapshot) {
    throw new Error(
      `No static snapshot for filters: ${key || "(default)"}. Re-run npm run export:static in server/.`,
    );
  }

  return {
    ...snapshot,
    refreshedAt: exported.exportedAt,
  };
}
