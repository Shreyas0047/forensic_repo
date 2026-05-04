import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import PageShell from "../components/layout/PageShell";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ScrollReveal from "../components/layout/ScrollReveal";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import CaseActivityChart from "../components/charts/CaseActivityChart";
import { dashboardApi } from "../services/dashboardService";
import { useAlerts } from "../context/AlertContext";
import { alertApi } from "../services/alertService";

export default function DashboardPage() {
  const [overview, setOverview] = useState({ cases: [], pagination: { total: 0 } });
  const { alerts = [] } = useAlerts() || {};

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

  const liveAlerts = alerts.slice(0, 5);

  return (
    <PageShell title="Investigation Dashboard" subtitle="Monitor active investigations, evidence pressure, and analysis throughput across your forensic workload.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total cases", metrics.totalCases],
          ["Active cases", metrics.activeCases],
          ["High-risk alerts", metrics.alerts],
          ["Assigned cases", metrics.assigned],
        ].map(([label, value]) => (
          <ScrollReveal key={label}>
            <Card hover>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                <AnimatedNumber value={value} />
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ScrollReveal>
          <RiskDistributionChart data={riskData} />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <CaseActivityChart data={activityData} />
        </ScrollReveal>
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ScrollReveal>
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Live Alert Panel</h3>
                <p className="mt-1 text-sm text-slate-500">Incoming dark web and high-risk intelligence.</p>
              </div>
              <Button variant="secondary" onClick={() => alertApi.analyzeDarkweb()}>
                Scan dark web
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {liveAlerts.map((alert) => (
                <div key={alert._id || alert.alertId || alert.createdAt} className="rounded-2xl border border-white/50 bg-white/55 p-4 shadow-md backdrop-blur-xl transition duration-300 hover:bg-white/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={alert.severity}>{alert.severity}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{alert.threatType || "Suspicious Activity"}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{alert.message}</p>
                </div>
              ))}
              {!liveAlerts.length ? <p className="text-sm text-slate-500">No live alerts yet.</p> : null}
            </div>
          </Card>
        </ScrollReveal>
      </section>
    </PageShell>
  );
}
