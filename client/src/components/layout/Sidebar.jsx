import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const navigation = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Cases", to: "/cases" },
  { label: "Evidence", to: "/evidence" },
  { label: "Analysis", to: "/analysis" },
  { label: "Blockchain", to: "/blockchain" },
  { label: "Audit Logs", to: "/audit" },
];

export default function Sidebar({ mobileOpen, onClose }) {
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">ForensicOps</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Cybercrime Intelligence</h1>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition duration-200",
                  isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/50 bg-white/50 p-4 shadow-md backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-900">Investigation workflow</p>
          <p className="mt-2 text-sm text-slate-500">Track evidence, AI findings, blockchain proofs, and audit history in one workspace.</p>
        </div>
      </aside>
    </>
  );
}
