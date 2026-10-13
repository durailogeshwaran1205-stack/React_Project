const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

export default function ProgressBar({ value, tone = "bg-electric", label }) {
  const v = clamp(value);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
      role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}
    >
      <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${v}%` }} />
    </div>
  );
}

/** Circular attendance indicator */
export function Ring({ value, size = 96, stroke = 9, children }) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-white/10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-electric transition-all duration-700" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
        />
      </svg>
      <span className="absolute text-sm font-bold">{children ?? `${v}%`}</span>
    </div>
  );
}
