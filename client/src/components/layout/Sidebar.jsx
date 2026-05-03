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
          "fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none",
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
                  isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Investigation workflow</p>
          <p className="mt-2 text-sm text-slate-500">Track evidence, AI findings, blockchain proofs, and audit history in one workspace.</p>
        </div>
      </aside>
    </>
  );
}
