import { formatDate } from "../utils/formatters";

export default function EventTimeline({ events = [] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Investigation Event Trace</h3>
        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{events.length} events</span>
      </div>
      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <div key={event._id} className="border-l border-emerald-500/40 pl-4">
            <p className="text-sm font-medium text-white">{event.action}</p>
            <p className="mt-1 text-sm text-slate-400">{event.description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{formatDate(event.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
