import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatters";

export default function CaseCard({ item }) {
  return (
    <Link
      to={`/cases/${item._id}`}
      className="block rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.caseNumber}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
          {item.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{item.description}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>{item.evidenceCount} Evidence</span>
        <span>{item.priority}</span>
        <span>{formatDate(item.createdAt)}</span>
      </div>
    </Link>
  );
}
