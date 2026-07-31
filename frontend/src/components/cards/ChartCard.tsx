import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  badge?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  badge,
}: ChartCardProps) {
  return (
    <section
      className={`card-base flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-card-hover ${className}`}
    >
      <header className="border-b border-border-subtle px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          </div>
          {badge ? (
            <span className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[11px] font-medium text-slate-500">
              {badge}
            </span>
          ) : null}
        </div>
      </header>
      <div className="min-h-0 flex-1 p-6 pt-5">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeader({ label, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <p className="section-label">{label}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}
