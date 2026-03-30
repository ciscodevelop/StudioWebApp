import { motion } from "framer-motion";

interface GameButtonsProps {
  isTimerActive: boolean;
  divisionSolved: boolean;
  divisionChangesUsed: number;
  onCheck: () => void;
  onHint: () => void;
  onNewDivision: () => void;
}

export const GameButtons = ({
  isTimerActive,
  divisionSolved,
  divisionChangesUsed,
  onCheck,
  onHint,
  onNewDivision,
}: GameButtonsProps) => {
  const changesRemaining = Math.max(0, 3 - divisionChangesUsed);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.55,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="row" variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn primary"
          onClick={onCheck}
          disabled={!isTimerActive || divisionSolved}
        >
          ✓ Controlla
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn"
          onClick={onHint}
          style={{ background: "#8b5cf6", color: "white" }}
        >
          💡 Aiuto
        </motion.button>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn primary"
        onClick={onNewDivision}
        disabled={isTimerActive && !divisionSolved && divisionChangesUsed >= 3}
      >
        ➕ Nuova Divisione ({changesRemaining}/3)
      </motion.button>
    </motion.div>
  );
};
