import { useMemo } from "react";
import { DifficultyLevel } from "../types/game.types";

interface AdaptiveStats {
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  bestStreak: number;
  avgTimePerQuestion?: number;
}

interface AdaptiveResult {
  currentAccuracy: number;
  suggestedDifficulty: DifficultyLevel;
  shouldAutoUpgrade: boolean;
  shouldAutoDowngrade: boolean;
  confidence: "low" | "medium" | "high";
  message: string;
}

const calculateAccuracy = (stats: AdaptiveStats): number => {
  const total = stats.correctAnswers + stats.wrongAnswers;
  if (total === 0) return 0;
  return (stats.correctAnswers / total) * 100;
};

const calculateConfidence = (stats: AdaptiveStats): "low" | "medium" | "high" => {
  const total = stats.correctAnswers + stats.wrongAnswers;
  if (total < 5) return "low";
  if (total < 15) return "medium";
  return "high";
};

export const useAdaptiveDifficulty = (
  currentDifficulty: DifficultyLevel,
  stats: AdaptiveStats,
): AdaptiveResult => {
  return useMemo(() => {
    const accuracy = calculateAccuracy(stats);
    const confidence = calculateConfidence(stats);
    const total = stats.correctAnswers + stats.wrongAnswers;

    let suggestedDifficulty = currentDifficulty;
    let shouldAutoUpgrade = false;
    let shouldAutoDowngrade = false;
    let message = "";

    // Solo suggerire con almeno 5 domande risposto
    if (total >= 5) {
      if (currentDifficulty === "easy") {
        // Easy → Medium
        if (accuracy >= 85 && stats.bestStreak >= 5) {
          suggestedDifficulty = "medium";
          shouldAutoUpgrade = true;
          message =
            "🚀 Molto bravo! Pronto per il livello MEDIO? Attivalo nelle impostazioni.";
        }
      } else if (currentDifficulty === "medium") {
        // Medium → Hard o → Easy
        if (accuracy >= 80 && stats.bestStreak >= 7) {
          suggestedDifficulty = "hard";
          shouldAutoUpgrade = true;
          message = "🔥 Eccezionale! Sfida il livello DIFFICILE?";
        } else if (accuracy <= 40) {
          suggestedDifficulty = "easy";
          shouldAutoDowngrade = true;
          message =
            "💪 Torna al livello FACILE per fare pratica, poi riproviamo!";
        }
      } else if (currentDifficulty === "hard") {
        // Hard → Medium
        if (accuracy <= 35) {
          suggestedDifficulty = "medium";
          shouldAutoDowngrade = true;
          message = "📚 Il livello DIFFICILE è tosto! Proviamo il MEDIO.";
        }
      }
    }

    return {
      currentAccuracy: Math.round(accuracy * 10) / 10,
      suggestedDifficulty,
      shouldAutoUpgrade,
      shouldAutoDowngrade,
      confidence,
      message,
    };
  }, [currentDifficulty, stats]);
};
