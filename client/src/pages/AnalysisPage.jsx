import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import RiskMeter from "../components/charts/RiskMeter";
import { analysisApi } from "../services/analysisService";
import { useAuth, ROLES } from "../context/AuthContext";

export default function AnalysisPage({ mode = "analysis" }) {
  const { evidenceId } = useParams();
  const [reports, setReports] = useState([]);
  const [blockchain, setBlockchain] = useState(null);
  const { hasRole } = useAuth();
  const canRunAnalysis = hasRole(ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST);
  const canStoreBlockchain = hasRole(ROLES.ADMIN, ROLES.INVESTIGATOR);

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
              ...(canRunAnalysis
                ? [
                    <Button key="run" onClick={() => analysisApi.analyze(evidenceId).then((data) => setReports([data, ...reports]))}>
                      Run analysis
                    </Button>,
                  ]
                : []),
              ...(canStoreBlockchain
                ? [
                    <Button key="store" variant="secondary" onClick={() => analysisApi.storeBlockchain(evidenceId).then(setBlockchain)}>
                      Store on blockchain
                    </Button>,
                  ]
                : []),
            ]
          : []
      }
    >
      {primary ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card accent="from-purple-500 to-indigo-500">
            <RiskMeter value={primary.finalRiskScore || primary.riskScore} />
          </Card>
          <Card accent="from-rose-500 to-orange-500">
            <h3 className="text-lg font-semibold text-slate-900">Threats Detected</h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone={primary.severity || "medium"}>{primary.severity || "medium"}</Badge>
              <Badge tone="analyst">{primary.threatType || "Suspicious Activity"}</Badge>
              {primary.confidenceScore ? <Badge tone="investigator">{Math.round(primary.confidenceScore * 100)}% confidence</Badge> : null}
            </div>
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
        <Card accent="from-purple-500 to-pink-500">
          <p className="text-sm text-slate-500">
            {canRunAnalysis
              ? "Open this page from an evidence item to view or trigger analysis."
              : "AI analysis is restricted to analyst, investigator, and admin roles."}
          </p>
        </Card>
      )}
    </PageShell>
  );
}
