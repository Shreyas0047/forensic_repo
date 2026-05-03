import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import TimelineList from "../components/layout/TimelineList";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { auditApi } from "../services/auditService";

export default function AuditTimelinePage() {
  const { caseId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [exportPayload, setExportPayload] = useState(null);

  useEffect(() => {
    if (!caseId) return;
    auditApi.getCaseAudit(caseId).then(setTimeline).catch(() => setTimeline([]));
  }, [caseId]);

  return (
    <PageShell
      title="Audit Logs"
      subtitle="Review normalized forensic history across event logs, chain of custody, and analysis operations."
      actions={
        caseId
          ? [
              <Button key="export" variant="secondary" onClick={() => auditApi.exportCase(caseId, "json").then(setExportPayload)}>
                Export JSON
              </Button>,
            ]
          : []
      }
    >
      {caseId ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TimelineList items={timeline} />
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Export Preview</h3>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              {exportPayload ? JSON.stringify(exportPayload, null, 2) : "Export a case audit package to inspect generated output."}
            </pre>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-500">Open audit logs from a case context to inspect its vertical timeline.</p>
        </Card>
      )}
    </PageShell>
  );
}
