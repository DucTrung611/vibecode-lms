interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
}

export function StatCard({ label, value, subLabel }: StatCardProps) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {subLabel ? (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subLabel}</p>
      ) : null}
    </div>
  );
}
