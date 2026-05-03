import Card from "../ui/Card";

export default function TimelineList({ items = [] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Investigation Timeline</h3>
      <div className="mt-6 space-y-5">
        {items.map((item, index) => (
          <div key={`${item.eventType}-${index}`} className="relative flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-slate-900" />
              {index < items.length - 1 ? <div className="mt-2 h-full w-px bg-slate-200" /> : null}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-slate-900">{item.description || item.eventType}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
              {item.performedBy?.name ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.performedBy.name}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
