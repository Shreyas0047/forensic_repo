import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import Card from "../ui/Card";

export default function CaseActivityChart({ data }) {
  return (
    <Card className="h-[360px]">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Case Activity</h3>
        <p className="text-sm text-slate-500">Daily operational movement across investigations.</p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="caseActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis dataKey="label" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#caseActivity)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
