import { motion } from "framer-motion";

interface DivisionDisplayProps {
  dividendo: number;
  divisore: number;
  shake: boolean;
}

export const DivisionDisplay = ({
  dividendo,
  divisore,
  shake,
}: DivisionDisplayProps) => {
  return (
    <motion.div
      className={`card ${shake ? "shake" : ""}`}
      animate={shake ? { x: [-5, 5, -5, 5, 0], rotate: [0, 1, -1, 1, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        key={dividendo}
        className="division"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {dividendo || "?"} ÷ {divisore || "?"}
      </motion.div>
    </motion.div>
  );
};
