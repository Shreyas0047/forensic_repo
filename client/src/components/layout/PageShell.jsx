import { motion } from "framer-motion";
import { pageMotion } from "../../utils/motion";

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-gradient-to-br from-white/80 via-blue-50/70 to-purple-50/80 px-6 py-6 shadow-lg shadow-slate-200/60 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Enterprise Workspace</p>
          <h1 className="mt-3 bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-3xl font-semibold text-transparent">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </motion.div>
  );
}
