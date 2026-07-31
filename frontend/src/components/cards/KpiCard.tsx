import { formatCurrency, formatNumber, formatPercent } from "../../lib/format";
import {
  IconTrendDown,
  IconTrendUp,
  KpiIcon,
  type KpiIconType,
} from "../ui/Icons";

interface KpiCardProps {
  label: string;
  value: string;
  changePct: number | null;
  comparisonLabel: string;
  icon: KpiIconType;
  index?: number;
}

export function KpiCard({
  label,
  value,
  changePct,
  comparisonLabel,
  icon,
  index = 0,
}: KpiCardProps) {
  const isPositive = changePct !== null && changePct >= 0;
  const isNegative = changePct !== null && changePct < 0;
  const isNeutral = changePct === null;

  return (
    <article
      className="group card-base flex flex-col p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover animate-slide-up opacity-0"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary transition-colors group-hover:bg-primary-muted">
          <KpiIcon type={icon} className="h-5 w-5" aria-hidden />
        </div>
        {!isNeutral && (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-positive-light text-positive"
                : isNegative
                  ? "bg-negative-light text-negative"
                  : "bg-surface-muted text-slate-500"
            }`}
          >
            {isPositive ? (
              <IconTrendUp className="h-3 w-3" aria-hidden />
            ) : isNegative ? (
              <IconTrendDown className="h-3 w-3" aria-hidden />
            ) : null}
            {formatPercent(changePct)}
          </div>
        )}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="metric-value mt-2">{value}</p>

      <div className="mt-auto pt-4">
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-500">{comparisonLabel}</span>
          {!isNeutral && (
            <span className="text-slate-400"> · period comparison</span>
          )}
        </p>
      </div>
    </article>
  );
}

export function buildKpiCards(
  kpis: {
    total_revenue_usd: number;
    total_orders: number;
    total_customers: number;
    avg_order_value_usd: number;
  },
  trends: {
    revenueChangePct: number | null;
    ordersChangePct: number | null;
    customersChangePct: number | null;
    aovChangePct: number | null;
    comparisonLabel: string;
  },
) {
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(kpis.total_revenue_usd),
      changePct: trends.revenueChangePct,
      comparisonLabel: trends.comparisonLabel,
      icon: "revenue" as const,
    },
    {
      label: "Total Orders",
      value: formatNumber(kpis.total_orders),
      changePct: trends.ordersChangePct,
      comparisonLabel: trends.comparisonLabel,
      icon: "orders" as const,
    },
    {
      label: "Total Customers",
      value: formatNumber(kpis.total_customers),
      changePct: trends.customersChangePct,
      comparisonLabel: trends.comparisonLabel,
      icon: "customers" as const,
    },
    {
      label: "Average Order Value",
      value: formatCurrency(kpis.avg_order_value_usd),
      changePct: trends.aovChangePct,
      comparisonLabel: trends.comparisonLabel,
      icon: "aov" as const,
    },
  ];
}
