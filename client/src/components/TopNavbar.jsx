import { useAuth } from "../context/AuthContext";

export default function TopNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Operational View</p>
        <h2 className="text-xl font-semibold text-white">Evidence Intelligence Console</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
          <p className="text-sm font-medium text-white">{user?.name || "Investigator"}</p>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{user?.role || "analyst"}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
