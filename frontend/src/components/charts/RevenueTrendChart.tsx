import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyRevenue } from "../../types/dashboard";
import { formatCurrency } from "../../lib/format";
import { EmptyState } from "../ui/EmptyState";

interface RevenueTrendChartProps {
  data: MonthlyRevenue[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: MonthlyRevenue; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((p) => p.dataKey === "revenue_usd");
  if (!revenue) return null;

  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-card-hover">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-slate-900">
        {formatCurrency(revenue.value)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {revenue.payload.total_orders.toLocaleString()} orders
      </p>
    </div>
  );
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No revenue data"
        description="Adjust filters to view monthly revenue performance."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden />
          Revenue (USD)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart
          data={data}
          margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#E2E8F0"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="year_month"
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            minTickGap={32}
            dy={8}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(Number(value), true)}
            width={64}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="revenue_usd"
            fill="url(#revenueGradient)"
            stroke="none"
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="revenue_usd"
            stroke="#2563EB"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#2563EB",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            isAnimationActive
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
