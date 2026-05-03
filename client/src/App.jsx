import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CaseListPage from "./pages/CaseListPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import EvidenceViewerPage from "./pages/EvidenceViewerPage";
import AnalysisPage from "./pages/AnalysisPage";
import AuditTimelinePage from "./pages/AuditTimelinePage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CaseListPage />} />
          <Route path="cases/:caseId" element={<CaseDetailsPage />} />
          <Route path="evidence" element={<EvidenceViewerPage />} />
          <Route path="evidence/:evidenceId" element={<EvidenceViewerPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="analysis/:evidenceId" element={<AnalysisPage />} />
          <Route path="blockchain" element={<AnalysisPage mode="blockchain" />} />
          <Route path="audit" element={<AuditTimelinePage />} />
          <Route path="audit/:caseId" element={<AuditTimelinePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
