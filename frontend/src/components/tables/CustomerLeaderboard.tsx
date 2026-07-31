import type { CustomerRank } from "../../types/dashboard";
import { formatCurrency, formatNumber } from "../../lib/format";
import { EmptyState } from "../ui/EmptyState";

interface CustomerLeaderboardProps {
  data: CustomerRank[];
}

function RankBadge({ rank }: { rank: number }) {
  const isTopThree = rank <= 3;

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
        isTopThree
          ? "bg-primary-light text-primary"
          : "bg-surface-muted text-slate-500"
      }`}
    >
      {rank}
    </span>
  );
}

function CustomerAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-slate-600 ring-1 ring-border"
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function CustomerLeaderboard({ data }: CustomerLeaderboardProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No customer data"
        description="Adjust filters to view top customers by revenue."
      />
    );
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Rank
            </th>
            <th className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Customer
            </th>
            <th className="hidden px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">
              Country
            </th>
            <th className="hidden px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:table-cell">
              Orders
            </th>
            <th className="px-3 pb-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer, index) => {
            const rank = index + 1;
            return (
              <tr
                key={customer.customer_key}
                className="group border-b border-border-subtle transition-colors last:border-0 hover:bg-surface/80"
              >
                <td className="px-3 py-3.5">
                  <RankBadge rank={rank} />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-3">
                    <CustomerAvatar name={customer.customer_name} />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900 group-hover:text-primary">
                        {customer.customer_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.continent}
                        <span className="sm:hidden"> · {customer.customer_country}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-3.5 text-sm text-slate-600 sm:table-cell">
                  {customer.customer_country}
                </td>
                <td className="hidden px-3 py-3.5 text-sm tabular-nums text-slate-600 md:table-cell">
                  {formatNumber(customer.total_orders)}
                </td>
                <td className="px-3 py-3.5 text-right text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(customer.total_revenue_usd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
