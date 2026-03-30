import { motion } from "framer-motion";

interface AIAnalyticsProps {
  accuracy: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  difficulty: string;
}

export const AIAnalytics = ({
  accuracy,
  streak,
  bestStreak,
  correctAnswers,
  wrongAnswers,
  difficulty,
}: AIAnalyticsProps) => {
  const total = correctAnswers + wrongAnswers;
  const isOptimal = accuracy >= 75 && accuracy <= 85;
  const performanceLabel =
    accuracy >= 90
      ? "Eccezionale! 🌟"
      : accuracy >= 80
        ? "Ottimo! 🎯"
        : accuracy >= 70
          ? "Buono! 👍"
          : accuracy >= 50
            ? "Accettabile 👌"
            : "Continua a provare! 💪";

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      style={{
        background: isOptimal
          ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(132, 204, 22, 0.1))"
          : "rgba(255, 255, 255, 0.5)",
        borderLeft: `4px solid ${isOptimal ? "#22c55e" : "#94a3b8"}`,
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#1f2937" }}>
        🤖 AI Analytics
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          fontSize: "13px",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontWeight: 600 }}>
            Accuratezza
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: accuracy >= 80 ? "#22c55e" : "#f59e0b",
            }}
          >
            {accuracy}%
          </p>
        </div>

        <div>
          <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontWeight: 600 }}>
            Performance
          </p>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
            {performanceLabel}
          </p>
        </div>

        <div>
          <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontWeight: 600 }}>
            Risposte
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            ✅ {correctAnswers} / ❌ {wrongAnswers}
          </p>
        </div>

        <div>
          <p style={{ margin: "0 0 4px 0", color: "#6b7280", fontWeight: 600 }}>
            Livello
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#8b5cf6",
            }}
          >
            {difficulty}
          </p>
        </div>
      </div>

      <p
        style={{
          margin: "12px 0 0 0",
          padding: "8px 0 0 0",
          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
          fontSize: "12px",
          color: "#6b7280",
          fontStyle: "italic",
        }}
      >
        💡 L'IA analizza le tue prestazioni e suggerisce il livello ideale.
      </p>
    </motion.div>
  );
};
