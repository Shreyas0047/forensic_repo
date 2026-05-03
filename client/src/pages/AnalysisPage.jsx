import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import RiskMeter from "../components/charts/RiskMeter";
import { analysisApi } from "../services/analysisService";

export default function AnalysisPage({ mode = "analysis" }) {
  const { evidenceId } = useParams();
  const [reports, setReports] = useState([]);
  const [blockchain, setBlockchain] = useState(null);

  useEffect(() => {
    if (!evidenceId) return;
    analysisApi.getReport(evidenceId).then(setReports).catch(() => setReports([]));
  }, [evidenceId]);

  const primary = reports[0];

  return (
    <PageShell
      title={mode === "blockchain" ? "Blockchain Verification" : "AI Analysis"}
      subtitle="Review explainable AI outcomes, evidence threat indicators, and integrity actions."
      actions={
        evidenceId
          ? [
              <Button key="run" onClick={() => analysisApi.analyze(evidenceId).then((data) => setReports([data, ...reports]))}>
                Run analysis
              </Button>,
              <Button key="store" variant="secondary" onClick={() => analysisApi.storeBlockchain(evidenceId).then(setBlockchain)}>
                Store on blockchain
              </Button>,
            ]
          : []
      }
    >
      {primary ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <RiskMeter value={primary.riskScore} />
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Threats Detected</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(primary.threatsDetected || []).map((item) => (
                <Badge key={item} tone="high">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">{primary.explanation}</p>
            {blockchain ? <p className="mt-5 text-sm text-emerald-700">Stored on {blockchain.network} in block {blockchain.blockNumber}.</p> : null}
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-500">Open this page from an evidence item to view or trigger analysis.</p>
        </Card>
      )}
    </PageShell>
  );
}
