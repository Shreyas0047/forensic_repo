export default function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-[0_14px_40px_rgba(59,130,246,0.08)] backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-blue-50 via-white to-purple-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 [&_tr]:transition [&_tr]:duration-300 [&_tr:hover]:bg-blue-50/50">{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}
