import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function Card({ className, children, hover = false, accent = "from-blue-500 to-purple-500" }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-xl transition duration-300 ease-in-out",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", accent)} />
      {children}
    </motion.div>
  );
}
