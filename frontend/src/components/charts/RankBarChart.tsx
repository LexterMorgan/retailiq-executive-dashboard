import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, truncateLabel } from "../../lib/format";
import { EmptyState } from "../ui/EmptyState";

export interface RankBarItem {
  label: string;
  value: number;
  secondary?: string;
}

interface RankBarChartProps {
  data: RankBarItem[];
  compactValue?: boolean;
  maxLabelWidth?: number;
}

function getBarColor(index: number, total: number): string {
  if (index === 0) return "#2563EB";
  const opacity = Math.max(0.35, 1 - (index / total) * 0.55);
  return `rgba(37, 99, 235, ${opacity})`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RankBarItem }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-card-hover">
      <p className="max-w-[220px] text-xs font-medium leading-snug text-slate-600">
        {item.label}
      </p>
      <p className="mt-1.5 text-base font-semibold tabular-nums text-slate-900">
        {formatCurrency(item.value)}
      </p>
      {item.secondary ? (
        <p className="mt-1 text-xs text-slate-500">{item.secondary}</p>
      ) : null}
    </div>
  );
}

export function RankBarChart({
  data,
  compactValue = true,
  maxLabelWidth = 128,
}: RankBarChartProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No ranking data"
        description="Adjust filters to compare performance across this dimension."
      />
    );
  }

  const chartHeight = Math.max(300, data.length * 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        barCategoryGap="20%"
      >
        <XAxis
          type="number"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(Number(value), compactValue)}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={maxLabelWidth}
          tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => truncateLabel(String(value), 22)}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(37, 99, 235, 0.04)", radius: 4 }}
        />
        <Bar
          dataKey="value"
          radius={[0, 6, 6, 0]}
          barSize={22}
          isAnimationActive
          animationDuration={600}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={getBarColor(index, data.length)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
