import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "./ui/Card";

export default function ProtectedRoute({ children, roles }) {
  const { token, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !hasRole(...roles)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-lg border-t-4 border-t-rose-500 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">Access Restricted</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">You do not have permission to view this section.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">This workspace is available only to authorized roles for investigation integrity and audit safety.</p>
        </Card>
      </div>
    );
  }

  return children;
}
