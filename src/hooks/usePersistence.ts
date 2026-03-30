import { useEffect } from "react";
import {
  PersistedGameState,
  GameActions,
  GameState,
} from "../types/game.types";
import { GAME_STORAGE_KEY } from "../constants/game.constants";

export const usePersistence = (state: GameState, actions: GameActions) => {
  const { isHydrated } = state;

  // Ripristino stato dopo refresh
  useEffect(() => {
    try {
      const rawState = localStorage.getItem(GAME_STORAGE_KEY);
      if (!rawState) {
        actions.setIsTimerActive(false);
        return;
      }

      const savedState = JSON.parse(rawState) as PersistedGameState;

      actions.setRandomDividendo(savedState.randomDividendo || 0);
      actions.setRandomDivisore(savedState.randomDivisore || 0);
      actions.setScore(savedState.score || 0);
      actions.setRewards(savedState.rewards || 0);
      actions.setStreak(savedState.streak || 0);
      actions.setBestStreak(savedState.bestStreak || 0);
      actions.setCorrectAnswers(savedState.correctAnswers || 0);

      const elapsedSeconds = Math.floor(
        (Date.now() - (savedState.lastSavedAt || Date.now())) / 1000,
      );

      if (savedState.isTimerActive) {
        const adjustedTimeLeft = (savedState.timeLeft || 0) - elapsedSeconds;

        if (adjustedTimeLeft <= 0) {
          actions.setTimeLeft(0);
          actions.setIsTimerActive(false);
          actions.setMessage("⏰ Tempo scaduto!");
          actions.setStreak(0);
          actions.setWrongAnswers((savedState.wrongAnswers || 0) + 1);
          actions.setScore(Math.max(0, (savedState.score || 0) - 1));
          actions.setDivisionChangesUsed(0);
        } else {
          actions.setTimeLeft(adjustedTimeLeft);
          actions.setIsTimerActive(true);
          actions.setMessage(savedState.message || "");
          actions.setWrongAnswers(savedState.wrongAnswers || 0);
        }
      } else {
        actions.setTimeLeft(savedState.timeLeft || 10);
        actions.setIsTimerActive(false);
        actions.setMessage(savedState.message || "");
        actions.setWrongAnswers(savedState.wrongAnswers || 0);
      }

      actions.setDivisionSolved(savedState.divisionSolved || false);
      actions.setHint(savedState.hint || "");

      actions.setDifficulty(savedState.difficulty || "easy");

      const safeDividendDigits = Math.min(
        Math.max(savedState.dividendDigits || 2, 1),
        4,
      );
      const safeDivisorDigits = Math.min(
        Math.max(savedState.divisorDigits || 1, 1),
        safeDividendDigits,
      );

      actions.setDividendDigits(safeDividendDigits);
      actions.setDivisorDigits(safeDivisorDigits);

      actions.setAvatarKey(savedState.avatarKey || "avatarF");
      actions.setPlayerName(savedState.playerName || "");
      actions.setDivisionChangesUsed(savedState.divisionChangesUsed || 0);
    } catch {
      localStorage.removeItem(GAME_STORAGE_KEY);
    }
  }, []);

  // Salvataggio stato automatico
  useEffect(() => {
    if (!isHydrated) return;

    const stateToSave: PersistedGameState = {
      randomDividendo: state.randomDividendo,
      randomDivisore: state.randomDivisore,
      score: state.score,
      rewards: state.rewards,
      streak: state.streak,
      bestStreak: state.bestStreak,
      correctAnswers: state.correctAnswers,
      wrongAnswers: state.wrongAnswers,
      timeLeft: state.timeLeft,
      isTimerActive: state.isTimerActive,
      divisionSolved: state.divisionSolved,
      message: state.message,
      hint: state.hint,
      difficulty: state.difficulty,
      dividendDigits: state.dividendDigits,
      divisorDigits: state.divisorDigits,
      avatarKey: state.avatarKey,
      playerName: state.playerName,
      divisionChangesUsed: state.divisionChangesUsed,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    state.randomDividendo,
    state.randomDivisore,
    state.score,
    state.rewards,
    state.streak,
    state.bestStreak,
    state.correctAnswers,
    state.wrongAnswers,
    state.timeLeft,
    state.isTimerActive,
    state.divisionSolved,
    state.message,
    state.hint,
    state.difficulty,
    state.dividendDigits,
    state.divisorDigits,
    state.avatarKey,
    state.playerName,
    state.divisionChangesUsed,
    isHydrated,
  ]);
};
