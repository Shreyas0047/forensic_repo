import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Card from "../ui/Card";

const COLORS = ["#0f172a", "#3b82f6", "#f59e0b", "#ef4444"];

export default function RiskDistributionChart({ data }) {
  return (
    <Card className="h-[360px]">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Risk Distribution</h3>
        <p className="text-sm text-slate-500">Current spread of evidence and case exposure levels.</p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={72} outerRadius={108} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
