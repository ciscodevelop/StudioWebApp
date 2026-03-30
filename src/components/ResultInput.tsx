import { motion } from "framer-motion";

interface ResultInputProps {
  userAnswer: string;
  isTimerActive: boolean;
  onAnswerChange: (answer: string) => void;
  onEnter: () => void;
}

export const ResultInput = ({
  userAnswer,
  isTimerActive,
  onAnswerChange,
  onEnter,
}: ResultInputProps) => {
  return (
    <motion.div
      className="card input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <input
        className="input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={userAnswer}
        disabled={!isTimerActive}
        onChange={(e) => onAnswerChange(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter();
          }
        }}
        placeholder="Inserisci il risultato..."
        autoFocus={isTimerActive}
      />
    </motion.div>
  );
};
