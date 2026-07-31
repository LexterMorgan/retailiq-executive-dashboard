import type { DashboardFilters, FilterOptions } from "../../types/dashboard";
import { SelectField } from "../ui/SelectField";
import { IconClock, IconDatabase } from "../ui/Icons";
import { formatDateTime } from "../../lib/format";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  filterOptions: FilterOptions | null;
  refreshedAt: string | null;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function DashboardHeader({
  filters,
  filterOptions,
  refreshedAt,
  onFiltersChange,
}: DashboardHeaderProps) {
  const activeFilterCount = [
    filters.year,
    filters.country,
    filters.category,
  ].filter(Boolean).length;

  return (
    <header className="sticky top-0 z-30 bg-white shadow-header">
      <div className="border-b border-border-subtle bg-white">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold tracking-tight text-white"
              aria-hidden
            >
              RQ
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  RetailIQ Executive Dashboard
                </h1>
                <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Executive
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
                Interactive executive analytics for global electronics retail
                performance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-slate-600">
              <IconClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <span className="text-slate-500">Last refreshed</span>
              <span className="font-medium text-slate-800">
                {refreshedAt ? formatDateTime(refreshedAt) : "—"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-slate-600">
              <IconDatabase className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <span className="text-slate-500">Source</span>
              <span className="font-medium text-slate-800">PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1480px] px-6 py-4 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <SelectField
                label="Year"
                value={filters.year ? String(filters.year) : ""}
                onChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    year: value ? Number(value) : undefined,
                  })
                }
                options={[
                  { label: "All years", value: "" },
                  ...(filterOptions?.years.map((year) => ({
                    label: String(year),
                    value: String(year),
                  })) ?? []),
                ]}
              />
              <SelectField
                label="Country"
                value={filters.country ?? ""}
                onChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    country: value || undefined,
                  })
                }
                options={[
                  { label: "All countries", value: "" },
                  ...(filterOptions?.countries.map((country) => ({
                    label: country,
                    value: country,
                  })) ?? []),
                ]}
              />
              <SelectField
                label="Category"
                value={filters.category ?? ""}
                onChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    category: value || undefined,
                  })
                }
                options={[
                  { label: "All categories", value: "" },
                  ...(filterOptions?.categories.map((category) => ({
                    label: category,
                    value: category,
                  })) ?? []),
                ]}
              />
            </div>
            <p className="text-xs text-slate-500">
              {activeFilterCount === 0
                ? "Showing all data"
                : `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} applied`}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
