import { motion, AnimatePresence } from "framer-motion";

interface HintDisplayProps {
  hint: string;
}

export const HintDisplay = ({ hint }: HintDisplayProps) => {
  return (
    <AnimatePresence>
      {hint && (
        <motion.p
          className="hint"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          💡 {hint}
        </motion.p>
      )}
    </AnimatePresence>
  );
};
