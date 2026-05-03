import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { evidenceApi } from "../services/evidenceService";
import { analysisApi } from "../services/analysisService";
import { auditApi } from "../services/auditService";

export default function EvidenceViewerPage() {
  const { evidenceId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [audit, setAudit] = useState([]);
  const [openAudit, setOpenAudit] = useState(false);

  useEffect(() => {
    if (!evidenceId) return;
    Promise.all([evidenceApi.getById(evidenceId), auditApi.getEvidenceAudit(evidenceId)]).then(([evidenceData, auditData]) => {
      setPayload(evidenceData);
      setAudit(auditData);
    });
  }, [evidenceId]);

  if (!payload?.evidence) {
    return (
      <PageShell title="Evidence Viewer" subtitle="Open an evidence item from a case to inspect its details." />
    );
  }

  const { evidence, blockchainRecord } = payload;

  return (
    <PageShell
      title={evidence.fileName}
      subtitle="Inspect metadata, trigger AI workflows, and review custody for this artifact."
      actions={[
        <Button key="analyze" onClick={() => navigate(`/analysis/${evidence._id}`)}>
          Analyze
        </Button>,
        <Button key="verify" variant="secondary" onClick={() => evidenceApi.verify(evidence._id)}>
          Verify
        </Button>,
        <Button key="custody" variant="secondary" onClick={() => setOpenAudit(true)}>
          View chain of custody
        </Button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">File type</p>
              <p className="mt-2 font-semibold text-slate-900">{evidence.fileType}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Size</p>
              <p className="mt-2 font-semibold text-slate-900">{evidence.fileSize} bytes</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">SHA-256</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{evidence.hash}</p>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Blockchain Status</h3>
          <div className="mt-5 space-y-3">
            <Badge tone={blockchainRecord?.verified ? "verified" : "medium"}>{blockchainRecord?.verified ? "Verified" : "Pending"}</Badge>
            <p className="text-sm text-slate-500">Network: {blockchainRecord?.network || "Not stored"}</p>
            <p className="text-sm text-slate-500">Transaction: {blockchainRecord?.transactionId || "Unavailable"}</p>
          </div>
        </Card>
      </div>
      <Modal open={openAudit} title="Chain of Custody" onClose={() => setOpenAudit(false)}>
        <div className="space-y-4">
          {audit.map((item, index) => (
            <div key={`${item.action}-${index}`} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{item.action}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-500">{item.performedBy?.name || "System"}</p>
            </div>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}
