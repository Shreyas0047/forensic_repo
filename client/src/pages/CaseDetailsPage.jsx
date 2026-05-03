import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import TimelineList from "../components/layout/TimelineList";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { caseApi } from "../services/caseService";
import { evidenceApi } from "../services/evidenceService";
import { analysisApi } from "../services/analysisService";

export default function CaseDetailsPage() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [similarCases, setSimilarCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      caseApi.getCase(caseId),
      caseApi.getTimeline(caseId),
      caseApi.getSimilarCases(caseId),
      analysisApi.getCaseReports(caseId),
    ]).then(([caseDetails, timelineData, similarData, reportData]) => {
      setCaseData(caseDetails);
      setTimeline(timelineData);
      setSimilarCases(similarData);
      setReports(reportData);
    });
  }, [caseId]);

  const blockchainReady = useMemo(
    () => (reports || []).filter((item) => item.rawOutput?.tampered !== true).length,
    [reports],
  );

  const handleUpload = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("caseId", caseId);
    await evidenceApi.upload(formData);
    const refreshed = await caseApi.getCase(caseId);
    setCaseData(refreshed);
    setUploadFile(null);
  };

  if (!caseData) return null;

  return (
    <PageShell
      title={caseData.case.title}
      subtitle="Review evidence, analysis, blockchain status, and timeline context for the current investigation."
      actions={[
        <Button key="upload" variant="secondary" onClick={() => setAuditOpen(true)}>
          Upload evidence
        </Button>,
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={caseData.case.status}>{caseData.case.status}</Badge>
            <Badge tone={caseData.case.priority}>{caseData.case.priority}</Badge>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{caseData.case.description}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Blockchain readiness</h3>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{blockchainReady}</p>
          <p className="mt-2 text-sm text-slate-500">Analysis reports ready for integrity verification.</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Evidence List</h3>
          <div className="mt-5">
            <Table
              columns={["File", "Type", "Hash", "Open"]}
              rows={caseData.evidence || []}
              renderRow={(item) => (
                <tr key={item._id}>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{item.fileName}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.fileType}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{item.hash.slice(0, 16)}...</td>
                  <td className="px-5 py-4">
                    <Link to={`/evidence/${item._id}`} className="text-sm font-medium text-sky-700">
                      View
                    </Link>
                  </td>
                </tr>
              )}
            />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Similar Cases</h3>
          <div className="mt-5 space-y-3">
            {similarCases.map((item) => (
              <div key={item.caseId} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">Similarity score: {item.similarityScore}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Analysis Reports</h3>
          <div className="mt-5 space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{report.evidenceId?.fileName || "Evidence"}</p>
                  <Badge tone={report.riskScore > 70 ? "high" : report.riskScore > 40 ? "medium" : "low"}>{report.riskScore}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{report.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
        <TimelineList items={timeline} />
      </section>

      <Modal open={auditOpen} title="Upload Evidence" onClose={() => setAuditOpen(false)}>
        <div className="space-y-4">
          <input type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
          <Button onClick={handleUpload}>Submit evidence</Button>
        </div>
      </Modal>
    </PageShell>
  );
}
