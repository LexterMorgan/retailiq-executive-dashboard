import { IconAlert } from "./Icons";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="card-base flex min-h-[360px] flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-negative-light text-negative">
        <IconAlert className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-lg font-semibold text-slate-900">
        Unable to load dashboard data
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover hover:shadow-md active:scale-[0.98]"
      >
        Retry connection
      </button>
    </div>
  );
}
