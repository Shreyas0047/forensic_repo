export default function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-emerald-400">{hint}</p>
    </div>
  );
}
