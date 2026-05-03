import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function Card({ className, children, hover = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      transition={{ duration: 0.22 }}
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
