import { useMemo } from "react";
import { buildExecutiveInsights } from "./lib/insights";
import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardHeader } from "./components/layout/DashboardHeader";
import { buildKpiCards, KpiCard } from "./components/cards/KpiCard";
import { ChartCard, SectionHeader } from "./components/cards/ChartCard";
import { InsightCard, InsightSkeleton } from "./components/cards/InsightCard";
import { RevenueTrendChart } from "./components/charts/RevenueTrendChart";
import { RankBarChart } from "./components/charts/RankBarChart";
import { CustomerLeaderboard } from "./components/tables/CustomerLeaderboard";
import {
  ChartSkeleton,
  KpiSkeleton,
  TableSkeleton,
} from "./components/ui/Skeleton";
import { ErrorState } from "./components/ui/ErrorState";
import { storeLabel, truncateLabel } from "./lib/format";

function App() {
  const { data, filterOptions, filters, loading, error, setFilters, retry } =
    useDashboardData();

  const insights = useMemo(
    () => (data ? buildExecutiveInsights(data) : []),
    [data],
  );

  const kpiCards = data ? buildKpiCards(data.kpis, data.trends) : [];

  const countryBars = useMemo(
    () =>
      data?.revenueByCountry.map((item) => ({
        label: item.country,
        value: item.revenue_usd,
        secondary: `${item.revenue_share_pct}% of total revenue`,
      })) ?? [],
    [data],
  );

  const productBars = useMemo(
    () =>
      data?.topProducts.map((item) => ({
        label: truncateLabel(item.product_name, 24),
        value: item.revenue_usd,
        secondary: item.category,
      })) ?? [],
    [data],
  );

  const storeBars = useMemo(
    () =>
      data?.topStores.map((item) => ({
        label: storeLabel(item),
        value: item.revenue_usd,
        secondary: `${item.total_orders.toLocaleString()} orders`,
      })) ?? [],
    [data],
  );

  const categoryBars = useMemo(
    () =>
      data?.categories.map((item) => ({
        label: item.category,
        value: item.revenue_usd,
        secondary: `${item.revenue_share_pct}% share`,
      })) ?? [],
    [data],
  );

  const brandBars = useMemo(
    () =>
      data?.brands.map((item) => ({
        label: item.brand,
        value: item.revenue_usd,
        secondary: `${item.profit_margin_pct}% margin`,
      })) ?? [],
    [data],
  );

  const isInitialLoad = loading && !data;

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader
        filters={filters}
        filterOptions={filterOptions}
        refreshedAt={data?.refreshedAt ?? null}
        onFiltersChange={setFilters}
      />

      <main className="mx-auto max-w-[1480px] px-6 py-10 lg:px-10">
        {error && !loading ? (
          <ErrorState message={error} onRetry={retry} />
        ) : (
          <div className="animate-fade-in space-y-12">
            {/* Row 1 — Executive KPIs */}
            <section aria-label="Executive KPIs">
              <SectionHeader
                label="Overview"
                title="Executive KPIs"
                description="Headline metrics for revenue, volume, and customer reach."
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isInitialLoad
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <KpiSkeleton key={index} />
                    ))
                  : kpiCards.map((kpi, index) => (
                      <KpiCard key={kpi.label} {...kpi} index={index} />
                    ))}
              </div>
            </section>

            {/* Row 2 — Business Performance */}
            <section aria-label="Business Performance">
              <SectionHeader
                label="Performance"
                title="Business Performance"
                description="Revenue trajectory and geographic contribution."
              />
              <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                {isInitialLoad ? (
                  <>
                    <ChartSkeleton tall />
                    <ChartSkeleton />
                  </>
                ) : (
                  <>
                    <ChartCard
                      title="Monthly Revenue Trend"
                      subtitle="Revenue generated over time across all regions."
                      badge="Primary metric"
                    >
                      <RevenueTrendChart data={data?.monthlyRevenue ?? []} />
                    </ChartCard>
                    <ChartCard
                      title="Revenue by Country"
                      subtitle="Geographic contribution to total revenue by store location."
                      badge="Top 8"
                    >
                      <RankBarChart
                        data={countryBars.slice(0, 8)}
                        maxLabelWidth={100}
                      />
                    </ChartCard>
                  </>
                )}
              </div>
            </section>

            {/* Row 3 — Operational Performance */}
            <section aria-label="Operational Performance">
              <SectionHeader
                label="Operations"
                title="Operational Performance"
                description="Product and store rankings by revenue."
              />
              <div className="grid gap-6 lg:grid-cols-2">
                {isInitialLoad ? (
                  <>
                    <ChartSkeleton />
                    <ChartSkeleton />
                  </>
                ) : (
                  <>
                    <ChartCard
                      title="Top Products"
                      subtitle="Products ranked by total revenue."
                      badge="Top 10"
                    >
                      <RankBarChart data={productBars} />
                    </ChartCard>
                    <ChartCard
                      title="Top Stores"
                      subtitle="Store locations ranked by revenue performance."
                      badge="Top 10"
                    >
                      <RankBarChart data={storeBars} />
                    </ChartCard>
                  </>
                )}
              </div>
            </section>

            {/* Row 4 — Customer & Category Insights */}
            <section aria-label="Customer and Category Insights">
              <SectionHeader
                label="Insights"
                title="Customer & Category Insights"
                description="High-value customers and category mix."
              />
              <div className="grid gap-6 lg:grid-cols-2">
                {isInitialLoad ? (
                  <>
                    <TableSkeleton />
                    <ChartSkeleton />
                  </>
                ) : (
                  <>
                    <ChartCard
                      title="Top Customers"
                      subtitle="Highest-value customers ranked by lifetime revenue."
                      badge="Leaderboard"
                    >
                      <CustomerLeaderboard data={data?.topCustomers ?? []} />
                    </ChartCard>
                    <ChartCard
                      title="Category Performance"
                      subtitle="Product categories ranked by revenue contribution."
                    >
                      <RankBarChart data={categoryBars} />
                    </ChartCard>
                  </>
                )}
              </div>
            </section>

            {/* Row 5 — Brand Analysis */}
            <section aria-label="Brand Analysis">
              <SectionHeader
                label="Portfolio"
                title="Brand Analysis"
                description="Vendor and brand-level revenue performance."
              />
              {isInitialLoad ? (
                <ChartSkeleton tall />
              ) : (
                <ChartCard
                  title="Brand Performance"
                  subtitle="Brand-level revenue ranking to inform vendor and assortment strategy."
                >
                  <RankBarChart data={brandBars} compactValue />
                </ChartCard>
              )}
            </section>

            {/* Executive Insights */}
            <section aria-label="Executive Insights">
              <SectionHeader
                label="Summary"
                title="Executive Insights"
                description="Key findings synthesized from current dashboard data to support leadership decisions."
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {isInitialLoad
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <InsightSkeleton key={index} />
                    ))
                  : insights.map((insight, index) => (
                      <InsightCard
                        key={insight.title}
                        title={insight.title}
                        summary={insight.summary}
                        index={index}
                      />
                    ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-white py-6">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-10">
          <p className="text-center text-xs text-slate-400">
            RetailIQ Executive Analytics · Powered by PostgreSQL · For internal leadership use
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
