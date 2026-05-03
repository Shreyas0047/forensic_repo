import { Link } from "react-router-dom";
import { formatDate, truncateHash } from "../utils/formatters";

export default function EvidenceTable({ evidence = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-glow">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900">
            <tr className="text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="px-5 py-4">Evidence</th>
              <th className="px-5 py-4">Lifecycle</th>
              <th className="px-5 py-4">Integrity</th>
              <th className="px-5 py-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((item) => (
              <tr key={item._id} className="border-t border-slate-800 text-sm text-slate-300">
                <td className="px-5 py-4">
                  <Link to={`/evidence/${item._id}`} className="font-medium text-white hover:text-emerald-300">
                    {item.originalName}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.mimeType}</p>
                </td>
                <td className="px-5 py-4">{item.lifecycleStatus}</td>
                <td className="px-5 py-4">
                  <p>{item.verificationStatus}</p>
                  <p className="mt-1 text-xs text-slate-500">{truncateHash(item.hash)}</p>
                </td>
                <td className="px-5 py-4">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
