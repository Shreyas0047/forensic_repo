import { motion } from "framer-motion";
import Card from "./Card";
import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <Button variant="subtle" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="mt-6">{children}</div>
        </Card>
      </motion.div>
    </div>
  );
}
