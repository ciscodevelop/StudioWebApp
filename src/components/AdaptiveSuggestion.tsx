import { motion, AnimatePresence } from "framer-motion";

interface AdaptiveSuggestionProps {
  accuracy: number;
  suggestedDifficulty: string;
  currentDifficulty: string;
  shouldAutoUpgrade: boolean;
  shouldAutoDowngrade: boolean;
  message: string;
  onAccept?: () => void;
  confidence: "low" | "medium" | "high";
}

export const AdaptiveSuggestion = ({
  accuracy,
  suggestedDifficulty,
  currentDifficulty,
  shouldAutoUpgrade,
  shouldAutoDowngrade,
  message,
  onAccept,
  confidence,
}: AdaptiveSuggestionProps) => {
  const shouldShow = shouldAutoUpgrade || shouldAutoDowngrade;

  const bgColor = shouldAutoUpgrade
    ? "linear-gradient(135deg, #22c55e 0%, #84cc16 100%)"
    : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)";

  const icon = shouldAutoUpgrade ? "🚀" : "💪";

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            background: bgColor,
            padding: "16px 20px",
            borderRadius: "16px",
            marginBottom: "16px",
            color: "white",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                AI Suggerisce: {suggestedDifficulty.toUpperCase()}
              </p>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                {message}
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "12px",
                  opacity: 0.85,
                }}
              >
                📊 Accuratezza: {accuracy}% ({confidence} confidence)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
