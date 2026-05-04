import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function TopNavbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { alerts = [] } = useAlerts() || {};
  const [query, setQuery] = useState("");
  const highRiskCount = alerts.filter((alert) => alert.severity === "high" || alert.severity === "critical").length;

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 px-4 py-4 shadow-lg shadow-slate-200/60 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onMenu} className="rounded-2xl border border-slate-200 p-3 text-slate-700 lg:hidden">
          <span className="block h-0.5 w-4 bg-current" />
          <span className="mt-1 block h-0.5 w-4 bg-current" />
          <span className="mt-1 block h-0.5 w-4 bg-current" />
        </button>
        <div className="flex-1">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases, hashes, users, or evidence..." className="max-w-xl bg-slate-50" />
        </div>
        <button type="button" className="relative rounded-2xl border border-white/50 bg-white/75 p-3 text-slate-600 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M10 21h4" />
          </svg>
          {highRiskCount ? <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-1.5 text-[10px] font-semibold text-white shadow-md shadow-red-500/30">{highRiskCount}</span> : null}
        </button>
        <div className="hidden rounded-2xl border border-white/60 bg-white/75 px-4 py-2.5 shadow-sm backdrop-blur-xl md:block">
          <p className="text-sm font-semibold text-slate-900">{user?.name || "Investigator"}</p>
          <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xs font-semibold uppercase tracking-[0.18em] text-transparent">{user?.role || "VIEWER"}</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
