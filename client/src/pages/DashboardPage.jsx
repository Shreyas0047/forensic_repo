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
import { useAuth, ROLES } from "../context/AuthContext";

export default function DashboardPage() {
  const [overview, setOverview] = useState({ cases: [], pagination: { total: 0 } });
  const { alerts = [] } = useAlerts() || {};
  const { hasRole } = useAuth();

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
          ["Total cases", metrics.totalCases, "from-blue-500 to-cyan-400"],
          ["Active cases", metrics.activeCases, "from-indigo-500 to-blue-500"],
          ["High-risk alerts", metrics.alerts, "from-rose-500 to-orange-500"],
          ["Assigned cases", metrics.assigned, "from-emerald-500 to-teal-400"],
        ].map(([label, value, accent]) => (
          <ScrollReveal key={label}>
            <Card hover accent={accent}>
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
          <Card accent="from-rose-500 to-orange-400">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Live Alert Panel</h3>
                <p className="mt-1 text-sm text-slate-500">Incoming dark web and high-risk intelligence.</p>
              </div>
              {hasRole(ROLES.ADMIN, ROLES.INVESTIGATOR) ? (
                <Button variant="secondary" onClick={() => alertApi.analyzeDarkweb()}>
                  Scan dark web
                </Button>
              ) : null}
            </div>
            <div className="mt-5 space-y-3">
              {liveAlerts.map((alert) => (
                <div key={alert._id || alert.alertId || alert.createdAt} className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/85">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={alert.severity}>{alert.severity}</Badge>
                    <span className="rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">{alert.threatType || "Suspicious Activity"}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{alert.message}</p>
                </div>
              ))}
              {!liveAlerts.length ? <p className="text-sm text-slate-500">No live alerts yet.</p> : null}
            </div>
          </Card>
        </ScrollReveal>
        {hasRole(ROLES.ADMIN, ROLES.ANALYST) ? (
          <ScrollReveal delay={0.06}>
            <Card accent="from-violet-500 to-fuchsia-500">
              <h3 className="text-lg font-semibold text-slate-900">AI Operations</h3>
              <p className="mt-2 text-sm text-slate-500">Analyst and admin roles can monitor model reasoning, confidence, and threat distribution.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-5 text-white shadow-lg shadow-violet-500/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">AI-ready cases</p>
                  <p className="mt-3 text-3xl font-semibold">
                    <AnimatedNumber value={(overview.cases || []).filter((item) => item.status !== "closed").length} />
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Threat pressure</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    <AnimatedNumber value={liveAlerts.filter((item) => ["high", "critical"].includes(item.severity)).length} />
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        ) : null}
      </section>
    </PageShell>
  );
}
