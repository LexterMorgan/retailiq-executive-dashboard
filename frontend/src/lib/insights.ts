import type { DashboardData, ExecutiveInsight } from "../types/dashboard";
import { formatCurrency, formatPercent } from "./format";

export function buildExecutiveInsights(data: DashboardData): ExecutiveInsight[] {
  const topCountry = data.revenueByCountry[0];
  const topCategory = data.categories[0];
  const topStore = data.topStores[0];
  const topCustomer = data.topCustomers[0];

  const continentTotals = data.topCustomers.reduce<Record<string, number>>(
    (acc, customer) => {
      acc[customer.continent] = (acc[customer.continent] ?? 0) + customer.total_revenue_usd;
      return acc;
    },
    {},
  );

  const leadingContinent = Object.entries(continentTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const insights: ExecutiveInsight[] = [];

  if (topCountry) {
    insights.push({
      title: "Geographic concentration",
      summary: `${topCountry.country} leads all markets with ${formatCurrency(topCountry.revenue_usd)} in revenue (${formatPercent(topCountry.revenue_share_pct).replace("+", "")} share), making it the primary engine of regional growth.`,
    });
  }

  if (topCategory) {
    insights.push({
      title: "Category leadership",
      summary: `${topCategory.category} is the highest-revenue category at ${formatCurrency(topCategory.revenue_usd)}, accounting for ${formatPercent(topCategory.revenue_share_pct).replace("+", "")} of sales and signaling where merchandising investment delivers the strongest return.`,
    });
  }

  if (topStore) {
    insights.push({
      title: "Store performance",
      summary: topStore.is_online
        ? `The online channel generated ${formatCurrency(topStore.revenue_usd)}, outperforming individual locations and reinforcing the importance of digital commerce in the revenue mix.`
        : `${topStore.store_state}, ${topStore.store_country} (Store ${topStore.store_key}) is the top-performing location with ${formatCurrency(topStore.revenue_usd)}, setting the benchmark for in-store execution.`,
    });
  }

  if (leadingContinent) {
    insights.push({
      title: "Customer value concentration",
      summary: `Among top accounts, ${leadingContinent[0]} customers represent the strongest revenue concentration at ${formatCurrency(leadingContinent[1])}, highlighting where loyalty and VIP programs may yield the highest ROI.`,
    });
  } else if (topCustomer) {
    insights.push({
      title: "High-value accounts",
      summary: `${topCustomer.customer_name} (${topCustomer.customer_country}) is the highest-value customer at ${formatCurrency(topCustomer.total_revenue_usd)}, underscoring the revenue impact of retaining top-tier buyers.`,
    });
  }

  return insights.slice(0, 4);
}
