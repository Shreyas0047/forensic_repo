import { AnimatePresence, motion } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import Badge from "../ui/Badge";

export default function NotificationToasts() {
  const { toasts = [], dismissToast } = useAlerts() || {};

  return (
    <div className="fixed right-4 top-20 z-50 w-[min(420px,calc(100vw-2rem))] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="rounded-2xl border border-white/40 bg-white/75 p-4 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={toast.severity}>{toast.severity}</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{toast.threatType}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">{toast.message}</p>
              </div>
              <button className="rounded-full px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => dismissToast(toast.id)}>
                x
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
