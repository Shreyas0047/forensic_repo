import { cn } from "../../utils/cn";

const toneMap = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  critical: "bg-red-100 text-red-800 border-red-300",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  tampered: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Badge({ tone, children }) {
  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize", toneMap[tone] || "bg-slate-100 text-slate-700 border-slate-200")}>
      {children}
    </span>
  );
}
