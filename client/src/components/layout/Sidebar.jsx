import { NavLink } from "react-router-dom";
import { useAuth, ROLES } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const navigation = [
  { label: "Dashboard", to: "/dashboard", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.VIEWER], accent: "from-blue-500 to-cyan-400" },
  { label: "Cases", to: "/cases", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.VIEWER], accent: "from-indigo-500 to-blue-500" },
  { label: "Evidence", to: "/evidence", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.VIEWER], accent: "from-emerald-500 to-teal-400" },
  { label: "Analysis", to: "/analysis", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST], accent: "from-violet-500 to-fuchsia-500" },
  { label: "Blockchain", to: "/blockchain", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST], accent: "from-amber-500 to-orange-500" },
  { label: "Audit Logs", to: "/audit", roles: [ROLES.ADMIN, ROLES.INVESTIGATOR, ROLES.ANALYST, ROLES.VIEWER], accent: "from-rose-500 to-orange-400" },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { hasRole, role } = useAuth();
  const filteredNavigation = navigation.filter((item) => hasRole(...item.roles));

  return (
    <>
      <div className={cn("fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden", mobileOpen ? "block" : "hidden")} onClick={onClose} />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-white/40 bg-white/60 px-6 py-8 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10">
          <div className="inline-flex rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-lg shadow-blue-500/20">
            ForensicOps
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Cybercrime Intelligence</h1>
          <p className="mt-3 text-sm text-slate-500">Role-aware investigation workspace with AI, audit, and integrity controls.</p>
        </div>
        <nav className="space-y-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition duration-300",
                  isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-white/80 hover:text-slate-900",
                )
              }
            >
              <span className={cn("absolute inset-y-0 left-0 w-1 rounded-r-full bg-gradient-to-b opacity-100", item.accent)} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-3xl border border-white/50 bg-white/65 p-5 shadow-lg backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">{role}</p>
          <p className="mt-3 text-base font-semibold text-slate-900">Investigation workflow</p>
          <p className="mt-2 text-sm text-slate-500">Track evidence, AI findings, blockchain proofs, and audit history in one workspace.</p>
        </div>
      </aside>
    </>
  );
}
