import { motion } from "framer-motion";

interface AwardsCardProps {
  rewards: number;
}

export const AwardsCard = ({ rewards }: AwardsCardProps) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h2>🏆 Premi</h2>
      <motion.div
        key={rewards}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div style={{ fontSize: "24px", fontWeight: "700" }}>{rewards} ⭐</div>
      </motion.div>
    </motion.div>
  );
};
