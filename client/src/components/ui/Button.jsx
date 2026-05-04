import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white/70 text-slate-700 border border-white/50 hover:border-slate-300 hover:bg-white backdrop-blur-xl",
  subtle: "bg-slate-100/80 text-slate-700 hover:bg-slate-200",
};

export default function Button({ className, variant = "primary", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm transition duration-200",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
