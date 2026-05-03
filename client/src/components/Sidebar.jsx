import { Link, NavLink } from "react-router-dom";

const navItems = [{ to: "/", label: "Investigation Dashboard" }];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/80 p-6 lg:block">
      <Link to="/" className="mb-10 block">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">Forensics OS</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Cybercrime Investigation Suite</h1>
      </Link>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm transition ${
                isActive ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-slate-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
