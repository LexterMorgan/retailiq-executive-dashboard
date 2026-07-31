import { IconInsight } from "../ui/Icons";

interface InsightCardProps {
  title: string;
  summary: string;
  index: number;
}

const accentStyles = [
  "border-l-primary bg-primary-light/30",
  "border-l-emerald-500 bg-emerald-50/50",
  "border-l-violet-500 bg-violet-50/40",
  "border-l-amber-500 bg-amber-50/40",
];

export function InsightCard({ title, summary, index }: InsightCardProps) {
  const accent = accentStyles[index % accentStyles.length];

  return (
    <article
      className={`group card-base border-l-[3px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover animate-slide-up opacity-0 ${accent}`}
      style={{
        animationDelay: `${240 + index * 80}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-slate-600 shadow-sm ring-1 ring-border transition-colors group-hover:text-primary">
          <IconInsight className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Insight {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900">
            {title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
            {summary}
          </p>
        </div>
      </div>
    </article>
  );
}

export function InsightSkeleton() {
  return (
    <div className="card-base border-l-[3px] border-l-slate-200 p-6">
      <div className="flex gap-3">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
