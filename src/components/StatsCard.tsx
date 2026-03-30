import { motion } from "framer-motion";

interface StatsCardProps {
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export const StatsCard = ({
  streak,
  bestStreak,
  correctAnswers,
  wrongAnswers,
}: StatsCardProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="card"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p variants={itemVariants} style={{ fontSize: "15px" }}>
        🔥 Vittorie Consecutive:{" "}
        <span style={{ fontWeight: "700", color: "#ef4444" }}>{streak}</span>
      </motion.p>
      <motion.p variants={itemVariants} style={{ fontSize: "15px" }}>
        🏆 Record:{" "}
        <span style={{ fontWeight: "700", color: "#f59e0b" }}>{bestStreak}</span>
      </motion.p>
      <motion.p
        variants={itemVariants}
        style={{ fontSize: "15px", letterSpacing: "1px" }}
      >
        ✅{" "}
        <span style={{ fontWeight: "700", color: "#22c55e" }}>
          {correctAnswers}
        </span>{" "}
        | ❌{" "}
        <span style={{ fontWeight: "700", color: "#ef4444" }}>
          {wrongAnswers}
        </span>
      </motion.p>
    </motion.div>
  );
};
