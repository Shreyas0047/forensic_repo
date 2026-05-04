import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { caseApi } from "../services/caseService";
import { useAuth, ROLES } from "../context/AuthContext";

export default function CaseListPage() {
  const [data, setData] = useState({ cases: [] });
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const { hasRole } = useAuth();

  useEffect(() => {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    caseApi.getDashboard(query).then(setData).catch(() => setData({ cases: [] }));
  }, [filters]);

  return (
    <PageShell title="Case Management" subtitle="Review cases by status, priority, and ownership to keep the investigation pipeline moving.">
      <Card accent="from-indigo-500 to-blue-500">
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Input placeholder="Search cases..." />
        </div>
      </Card>
      <Table
        columns={["Title", "Status", "Priority", "Assigned To", "Open"]}
        rows={data.cases || []}
        renderRow={(item) => (
          <tr key={item._id} className="text-sm text-slate-700">
            <td className="px-5 py-4 font-medium text-slate-900">{item.title}</td>
            <td className="px-5 py-4">
              <Badge tone={item.status}>{item.status}</Badge>
            </td>
            <td className="px-5 py-4">
              <Badge tone={item.priority}>{item.priority}</Badge>
            </td>
            <td className="px-5 py-4">{item.assignedTo?.name || "Unassigned"}</td>
            <td className="px-5 py-4">
              <Link to={`/cases/${item._id}`} className="font-medium text-blue-700 transition hover:text-purple-700">
                View case
              </Link>
              {!hasRole(ROLES.ADMIN) ? <span className="ml-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{hasRole(ROLES.VIEWER) ? "Read only" : ""}</span> : null}
            </td>
          </tr>
        )}
      />
    </PageShell>
  );
}
