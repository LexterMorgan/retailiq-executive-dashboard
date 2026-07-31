import { IconChevronDown } from "./Icons";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <label className="group flex min-w-[148px] flex-1 flex-col gap-1.5 sm:flex-none">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-filter transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        >
          {options.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-slate-500"
          aria-hidden
        />
      </div>
    </label>
  );
}
