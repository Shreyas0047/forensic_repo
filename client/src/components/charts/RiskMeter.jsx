export default function RiskMeter({ value = 0 }) {
  const normalized = Math.min(Math.max(value, 0), 100);
  const stroke = normalized > 70 ? "#ef4444" : normalized > 40 ? "#f59e0b" : "#16a34a";

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-28 w-28">
        <circle cx="60" cy="60" r="46" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(normalized / 100) * 289} 289`}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="66" textAnchor="middle" className="fill-slate-900 text-xl font-semibold">
          {normalized}
        </text>
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-500">AI risk score</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {normalized >= 70 ? "High severity" : normalized >= 40 ? "Moderate risk" : "Low risk"}
        </p>
      </div>
    </div>
  );
}
