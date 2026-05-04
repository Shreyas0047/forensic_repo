import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function Card({ className, children, hover = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "rounded-2xl border border-white/40 bg-white/65 p-6 shadow-lg backdrop-blur-xl transition duration-300 ease-in-out",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
