import { useCallback, useEffect, useState } from "react";
import { fetchDashboardData, fetchFilterOptions } from "../lib/api";
import type {
  DashboardData,
  DashboardFilters,
  FilterOptions,
} from "../types/dashboard";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFiltersState] = useState<DashboardFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const loadDashboard = useCallback(async (nextFilters: DashboardFilters) => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchDashboardData(nextFilters);
      setData(dashboard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(filters);
  }, [filters, loadDashboard]);

  const setFilters = useCallback((nextFilters: DashboardFilters) => {
    setFiltersState(nextFilters);
  }, []);

  const retry = useCallback(() => {
    loadDashboard(filters);
  }, [filters, loadDashboard]);

  return {
    data,
    filterOptions,
    filters,
    loading,
    error,
    setFilters,
    retry,
  };
}
