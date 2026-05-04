import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CaseListPage = lazy(() => import("./pages/CaseListPage"));
const CaseDetailsPage = lazy(() => import("./pages/CaseDetailsPage"));
const EvidenceViewerPage = lazy(() => import("./pages/EvidenceViewerPage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const AuditTimelinePage = lazy(() => import("./pages/AuditTimelinePage"));

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="p-8 text-slate-500">Loading workspace...</div>}>
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
      </Suspense>
    </AnimatePresence>
  );
}
