import { motion } from "framer-motion";

interface TimerDisplayProps {
  timeLeft: number;
}

export const TimerDisplay = ({ timeLeft }: TimerDisplayProps) => {
  const isLow = timeLeft < 6;
  const color = isLow ? "#ef4444" : timeLeft < 11 ? "#f59e0b" : "#22c55e";

  return (
    <motion.div
      className="card"
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isLow ? Infinity : 0, duration: 0.6 }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color,
          transition: "color 0.3s ease",
        }}
      >
        ⏱️ {timeLeft}s
      </div>
    </motion.div>
  );
};
