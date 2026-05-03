import { motion } from "framer-motion";
import { pageMotion } from "../../utils/motion";

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </motion.div>
  );
}
