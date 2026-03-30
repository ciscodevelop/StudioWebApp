export type DifficultyLevel = "easy" | "medium" | "hard";
export type AvatarKey = "avatarF" | "avatarM";

export interface PersistedGameState {
  randomDividendo: number;
  randomDivisore: number;
  score: number;
  rewards: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeLeft: number;
  isTimerActive: boolean;
  divisionSolved: boolean;
  message: string;
  hint: string;
  difficulty: DifficultyLevel;
  dividendDigits: number;
  divisorDigits: number;
  avatarKey: AvatarKey;
  playerName: string;
  divisionChangesUsed: number;
  lastSavedAt: number;
}

export interface GameState {
  randomDividendo: number;
  randomDivisore: number;
  userAnswer: string;
  message: string;
  hint: string;
  divisionSolved: boolean;
  shake: boolean;
  score: number;
  rewards: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  difficulty: DifficultyLevel;
  dividendDigits: number;
  divisorDigits: number;
  avatarKey: AvatarKey;
  playerName: string;
  divisionChangesUsed: number;
  timeLeft: number;
  isTimerActive: boolean;
  isHydrated: boolean;
}

export interface GameActions {
  setRandomDividendo: (value: number) => void;
  setRandomDivisore: (value: number) => void;
  setUserAnswer: (value: string) => void;
  setMessage: (value: string) => void;
  setHint: (value: string) => void;
  setDivisionSolved: (value: boolean) => void;
  setShake: (value: boolean) => void;
  setScore: (value: number | ((prev: number) => number)) => void;
  setRewards: (value: number | ((prev: number) => number)) => void;
  setStreak: (value: number | ((prev: number) => number)) => void;
  setBestStreak: (value: number | ((prev: number) => number)) => void;
  setCorrectAnswers: (value: number | ((prev: number) => number)) => void;
  setWrongAnswers: (value: number | ((prev: number) => number)) => void;
  setDifficulty: (value: DifficultyLevel) => void;
  setDividendDigits: (value: number) => void;
  setDivisorDigits: (value: number) => void;
  setAvatarKey: (value: AvatarKey) => void;
  setPlayerName: (value: string) => void;
  setDivisionChangesUsed: (value: number | ((prev: number) => number)) => void;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  setIsTimerActive: (value: boolean) => void;
}
