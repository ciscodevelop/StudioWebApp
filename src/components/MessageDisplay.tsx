import { motion, AnimatePresence } from "framer-motion";

interface MessageDisplayProps {
  message: string;
  streak: number;
}

export const MessageDisplay = ({ message, streak }: MessageDisplayProps) => {
  const color =
    streak > 5 ? "#f59e0b" : message.includes("🎉") ? "#22c55e" : "#ef4444";

  return (
    <AnimatePresence>
      {message && (
        <motion.h3
          style={{
            color,
            margin: "16px 0",
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.h3>
      )}
    </AnimatePresence>
  );
};
