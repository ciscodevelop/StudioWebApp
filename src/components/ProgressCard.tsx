import { motion } from "framer-motion";

interface ProgressCardProps {
  score: number;
}

export const ProgressCard = ({ score }: ProgressCardProps) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
    >
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
        Progresso verso stella
      </p>
      <p style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 12px 0" }}>
        {score} / 10
      </p>
      <div className="bar">
        <motion.div
          style={{ width: `${score * 10}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};
