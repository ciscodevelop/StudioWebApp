import { motion } from "framer-motion";
import { DivisionLogEntry } from "../types/game.types";

interface DivisionLogCardProps {
  logs: DivisionLogEntry[];
}

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getReasonLabel = (reason: DivisionLogEntry["reason"]) => {
  if (reason === "correct-answer") return "Risposta corretta";
  if (reason === "timeout") return "Tempo scaduto";
  return "Cambiata divisione";
};

export const DivisionLogCard = ({ logs }: DivisionLogCardProps) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
    >
      <h3 className="division-log-title">
        Registro Divisioni ({logs.length})
      </h3>

      {logs.length === 0 ? (
        <p className="division-log-empty">
          Nessuna divisione registrata ancora.
        </p>
      ) : (
        <div className="division-log-list">
          {logs.slice(0, 30).map((entry) => (
            <div
              key={entry.id}
              className={`division-log-item ${
                entry.status === "completed"
                  ? "division-log-item-completed"
                  : "division-log-item-not-completed"
              }`}
            >
              <p className="division-log-line division-log-main">
                {entry.dividendo} / {entry.divisore} = {entry.correctResult}
              </p>
              <p className="division-log-line">
                Stato: {entry.status === "completed" ? "Completata" : "Non completata"} | Motivo: {getReasonLabel(entry.reason)}
              </p>
              <p className="division-log-line">
                Inizio/Fine: {formatDateTime(entry.startedAt)} {"->"} {formatDateTime(entry.endedAt)}
              </p>
              <p className="division-log-line">
                Difficolta: {entry.difficulty.toUpperCase()} | Cifre: {entry.dividendDigits}/{entry.divisorDigits} | Durata: {entry.durationSeconds}s
              </p>
              <p className="division-log-line division-log-last-line">
                Risposta utente: {entry.userAnswer || "-"} | Errori: {entry.wrongAttempts} | Hint: {entry.hintsUsed} | Cambi: {entry.divisionChangesUsed} | Punti: {entry.scoreBefore} {"->"} {entry.scoreAfter} | Stelle: {entry.rewardsBefore} {"->"} {entry.rewardsAfter}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
