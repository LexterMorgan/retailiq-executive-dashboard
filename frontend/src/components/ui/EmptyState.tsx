interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-8 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-slate-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" d="M4 19h16M6 16l3-8 4 4 4-6 3 6" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
