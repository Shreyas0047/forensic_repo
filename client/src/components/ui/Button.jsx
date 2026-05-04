import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-purple-500/25",
  secondary: "bg-white/75 text-slate-700 border border-white/60 hover:border-slate-300 hover:bg-white backdrop-blur-xl",
  subtle: "bg-gradient-to-r from-emerald-50 to-cyan-50 text-slate-700 hover:from-emerald-100 hover:to-cyan-100",
  danger: "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25",
};

export default function Button({ className, variant = "primary", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm transition duration-300 ease-in-out",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
