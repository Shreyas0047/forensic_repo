import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import PageShell from "../components/layout/PageShell";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import CaseActivityChart from "../components/charts/CaseActivityChart";
import { dashboardApi } from "../services/dashboardService";

export default function DashboardPage() {
  const [overview, setOverview] = useState({ cases: [], pagination: { total: 0 } });

  useEffect(() => {
    dashboardApi.getOverview().then(setOverview).catch(() => setOverview({ cases: [], pagination: { total: 0 } }));
  }, []);

  const metrics = useMemo(() => {
    const cases = overview.cases || [];
    return {
      totalCases: overview.pagination?.total || cases.length,
      activeCases: cases.filter((item) => item.status === "in-progress").length,
      alerts: cases.filter((item) => item.priority === "high").length,
      assigned: cases.filter((item) => item.assignedTo).length,
    };
  }, [overview]);

  const riskData = useMemo(
    () => [
      { name: "Low", value: (overview.cases || []).filter((item) => item.priority === "low").length },
      { name: "Medium", value: (overview.cases || []).filter((item) => item.priority === "medium").length },
      { name: "High", value: (overview.cases || []).filter((item) => item.priority === "high").length },
      { name: "Closed", value: (overview.cases || []).filter((item) => item.status === "closed").length },
    ],
    [overview],
  );

  const activityData = useMemo(
    () =>
      (overview.cases || [])
        .slice(0, 7)
        .reverse()
        .map((item, index) => ({
          label: `D${index + 1}`,
          value: item.priority === "high" ? 9 : item.priority === "medium" ? 6 : 3,
        })),
    [overview],
  );

  return (
    <PageShell title="Investigation Dashboard" subtitle="Monitor active investigations, evidence pressure, and analysis throughput across your forensic workload.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total cases", metrics.totalCases],
          ["Active cases", metrics.activeCases],
          ["High-risk alerts", metrics.alerts],
          ["Assigned cases", metrics.assigned],
        ].map(([label, value]) => (
          <Card key={label} hover>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <RiskDistributionChart data={riskData} />
        <CaseActivityChart data={activityData} />
      </section>
    </PageShell>
  );
}
