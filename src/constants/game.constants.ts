import { DifficultyLevel, AvatarKey } from "../types/game.types";

export const GAME_STORAGE_KEY = "division-game-state-v1";
export const DIVISION_LOG_STORAGE_KEY = "division-game-log-v1";
export const MAX_DIVISION_LOG_ENTRIES = 300;

export const timerByDifficulty: Record<DifficultyLevel, number> = {
  easy: 20, // es. 48÷6
  medium: 100, // es. 144÷12
  hard: 180, // es. 576÷24
};

export const maxQuotientByDifficulty: Record<DifficultyLevel, number> = {
  easy: 9,
  medium: 30,
  hard: 90,
};

export const minQuotientByDifficulty: Record<DifficultyLevel, number> = {
  easy: 3, // Evita divisioni troppo banali per bambini 9+
  medium: 5,
  hard: 8,
};

export const digitPresetByDifficulty: Record<
  DifficultyLevel,
  { dividendDigits: number; divisorDigits: number }
> = {
  easy: { dividendDigits: 2, divisorDigits: 1 },
  medium: { dividendDigits: 2, divisorDigits: 1 },
  hard: { dividendDigits: 3, divisorDigits: 2 },
};

export const avatarMap: Record<AvatarKey, string> = {
  avatarF: "avatarF",
  avatarM: "avatarM",
};
