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
  weightedScore: number;
  suggestedDifficulty: DifficultyLevel;
  shouldAutoUpgrade: boolean;
  shouldAutoDowngrade: boolean;
  shouldApplyChange: boolean;
  confidence: "low" | "medium" | "high";
  message: string;
}

// --------------------
// CONFIG (facile da tweakare)
// --------------------
const CONFIG = {
  MIN_QUESTIONS: 5,

  UPGRADE: {
    easyToMedium: 85,
    mediumToHard: 82,
  },

  DOWNGRADE: {
    mediumToEasy: 45,
    hardToMedium: 50,
  },

  STREAK: {
    medium: 5,
    hard: 7,
  },

  SPEED: {
    fastThreshold: 10, // secondi medi
  },

  HYSTERESIS: 5, // evita oscillazioni
};

// --------------------
// HELPERS
// --------------------
const calculateAccuracy = (stats: AdaptiveStats): number => {
  const total = stats.correctAnswers + stats.wrongAnswers;
  if (total === 0) return 0;
  return (stats.correctAnswers / total) * 100;
};

const calculateConfidence = (
  stats: AdaptiveStats,
): "low" | "medium" | "high" => {
  const total = stats.correctAnswers + stats.wrongAnswers;
  if (total < 5) return "low";
  if (total < 15) return "medium";
  return "high";
};

const calculateSpeedScore = (avgTime?: number): number => {
  if (!avgTime) return 0;
  return Math.max(0, 20 - avgTime); // più veloce = punteggio più alto
};

// --------------------
// HOOK
// --------------------
export const useAdaptiveDifficulty = (
  currentDifficulty: DifficultyLevel,
  stats: AdaptiveStats,
): AdaptiveResult => {
  return useMemo(() => {
    const total = stats.correctAnswers + stats.wrongAnswers;

    const accuracy = calculateAccuracy(stats);
    const confidence = calculateConfidence(stats);
    const speedScore = calculateSpeedScore(stats.avgTimePerQuestion);

    // 🎯 SCORE INTELLIGENTE
    const weightedScore =
      accuracy * 0.7 +
      Math.min(stats.streak / 10, 1) * 20 +
      speedScore;

    const isFast =
      stats.avgTimePerQuestion !== undefined &&
      stats.avgTimePerQuestion < CONFIG.SPEED.fastThreshold;

    let suggestedDifficulty = currentDifficulty;
    let shouldAutoUpgrade = false;
    let shouldAutoDowngrade = false;
    let message = "";

    // 🚫 BLOCCO se pochi dati
    if (total < CONFIG.MIN_QUESTIONS || confidence === "low") {
      return {
        currentAccuracy: Math.round(accuracy * 10) / 10,
        weightedScore: Math.round(weightedScore),
        suggestedDifficulty,
        shouldAutoUpgrade: false,
        shouldAutoDowngrade: false,
        shouldApplyChange: false,
        confidence,
        message: "📊 Sto ancora analizzando il tuo livello...",
      };
    }

    // --------------------
    // EASY
    // --------------------
    if (currentDifficulty === "easy") {
      if (
        accuracy >= CONFIG.UPGRADE.easyToMedium + CONFIG.HYSTERESIS &&
        stats.bestStreak >= CONFIG.STREAK.medium
      ) {
        suggestedDifficulty = "medium";
        shouldAutoUpgrade = true;

        message = `🚀 ${stats.bestStreak} di fila! Passa al livello MEDIO!`;
      }
    }

    // --------------------
    // MEDIUM
    // --------------------
    else if (currentDifficulty === "medium") {
      if (
        accuracy >= CONFIG.UPGRADE.mediumToHard + CONFIG.HYSTERESIS &&
        stats.bestStreak >= CONFIG.STREAK.hard &&
        isFast
      ) {
        suggestedDifficulty = "hard";
        shouldAutoUpgrade = true;

        message = `🔥 Sei velocissimo! Prova il livello DIFFICILE!`;
      } else if (
        accuracy <= CONFIG.DOWNGRADE.mediumToEasy - CONFIG.HYSTERESIS &&
        stats.streak < 3
      ) {
        suggestedDifficulty = "easy";
        shouldAutoDowngrade = true;

        message = "💪 Facciamo un passo indietro e consolidiamo!";
      }
    }

    // --------------------
    // HARD
    // --------------------
    else if (currentDifficulty === "hard") {
      if (
        accuracy <= CONFIG.DOWNGRADE.hardToMedium - CONFIG.HYSTERESIS &&
        stats.streak < 3
      ) {
        suggestedDifficulty = "medium";
        shouldAutoDowngrade = true;

        message = "📚 Il livello difficile è tosto! Torniamo al medio.";
      }
    }

    // 🎯 AUTO APPLY SOLO SE CONFIDENZA ALTA
    const shouldApplyChange =
      confidence === "high" &&
      (shouldAutoUpgrade || shouldAutoDowngrade);

    return {
      currentAccuracy: Math.round(accuracy * 10) / 10,
      weightedScore: Math.round(weightedScore),
      suggestedDifficulty,
      shouldAutoUpgrade,
      shouldAutoDowngrade,
      shouldApplyChange,
      confidence,
      message,
    };
  }, [currentDifficulty, stats]);
};