import "./App.css";
import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import useSound from "use-sound";

// Components
import { AvatarDisplay } from "./components/AvatarDisplay";
import { PlayerNameInput } from "./components/PlayerNameInput";
import { AvatarPicker } from "./components/AvatarPicker";
import { AwardsCard } from "./components/AwardsCard";
import { ProgressCard } from "./components/ProgressCard";
import { StatsCard } from "./components/StatsCard";
import { DifficultySettings } from "./components/DifficultySettings";
import { DivisionDisplay } from "./components/DivisionDisplay";
import { TimerDisplay } from "./components/TimerDisplay";
import { ResultInput } from "./components/ResultInput";
import { GameButtons } from "./components/GameButtons";
import { MessageDisplay } from "./components/MessageDisplay";
import { HintDisplay } from "./components/HintDisplay";
import { AdaptiveSuggestion } from "./components/AdaptiveSuggestion";
import { AIAnalytics } from "./components/AIAnalytics";
import { DivisionLogCard } from "./components/DivisionLogCard";

// Hooks
import { usePersistence } from "./hooks/usePersistence";
import { useVibration } from "./hooks/useVibration";
import { useAdaptiveDifficulty } from "./hooks/useAdaptiveDifficulty";

// Types & Constants
import {
  DifficultyLevel,
  AvatarKey,
  GameState,
  GameActions,
  DivisionLogEntry,
} from "./types/game.types";
import {
  DIVISION_LOG_STORAGE_KEY,
  MAX_DIVISION_LOG_ENTRIES,
  timerByDifficulty,
  maxQuotientByDifficulty,
  minQuotientByDifficulty,
  digitPresetByDifficulty,
} from "./constants/game.constants";

// Utils
import { generateDivision } from "./utils/math.utils";
import { generateAiHint } from "./utils/aiHint.utils";

// Images & Sounds
import avatarFImage from "./images/avatar/avatarF.png";
import avatarMImage from "./images/avatar/avatarM.png";
import successSfx from "./sounds/success.wav";
import errorSfx from "./sounds/error.wav";
import Gift from "./sounds/success.wav";
import SuperGift from "./sounds/success.wav";

interface ActiveDivisionLogContext {
  id: string;
  startedAt: number;
  dividendDigits: number;
  divisorDigits: number;
  difficulty: DifficultyLevel;
  dividendo: number;
  divisore: number;
  wrongAttempts: number;
  hintsUsed: number;
  divisionChangesUsed: number;
  scoreBefore: number;
  rewardsBefore: number;
}

function App() {
  const SETTINGS_UNLOCK_PASSWORD = "Cisco_123";

  // --- STATI BASE ---
  const [randomDividendo, setRandomDividendo] = useState(0);
  const [randomDivisore, setRandomDivisore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState("");
  const [divisionSolved, setDivisionSolved] = useState(false);
  const [shake, setShake] = useState(false);

  // --- GAME STATE ---
  const [score, setScore] = useState(0);
  const [rewards, setRewards] = useState(0);

  // --- EDUCATIVO ---
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  // --- IMPOSTAZIONI DIFFICOLTA ---
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [dividendDigits, setDividendDigits] = useState(3);
  const [divisorDigits, setDivisorDigits] = useState(2);
  const [isSettingsLocked, setIsSettingsLocked] = useState(true);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("avatarF");
  const [playerName, setPlayerName] = useState("");
  const [divisionChangesUsed, setDivisionChangesUsed] = useState(0);

  // --- TIMER ---
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [divisionLogs, setDivisionLogs] = useState<DivisionLogEntry[]>([]);

  const activeDivisionLogRef = useRef<ActiveDivisionLogContext | null>(null);
  const userAnswerRef = useRef("");

  const pushDivisionLog = (entry: DivisionLogEntry) => {
    setDivisionLogs((prevLogs) => [
      entry,
      ...prevLogs.slice(0, MAX_DIVISION_LOG_ENTRIES - 1),
    ]);
  };

  const startDivisionLog = (params: {
    dividendo: number;
    divisore: number;
    difficulty: DifficultyLevel;
    dividendDigits: number;
    divisorDigits: number;
  }) => {
    activeDivisionLogRef.current = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: Date.now(),
      dividendDigits: params.dividendDigits,
      divisorDigits: params.divisorDigits,
      difficulty: params.difficulty,
      dividendo: params.dividendo,
      divisore: params.divisore,
      wrongAttempts: 0,
      hintsUsed: 0,
      divisionChangesUsed: 0,
      scoreBefore: score,
      rewardsBefore: rewards,
    };
  };

  const finalizeDivisionLog = (params: {
    status: DivisionLogEntry["status"];
    reason: DivisionLogEntry["reason"];
    userAnswer: string;
    scoreAfter: number;
    rewardsAfter: number;
    timeLeftAtEnd: number;
    divisionChangesUsed?: number;
  }) => {
    const currentLog = activeDivisionLogRef.current;
    if (!currentLog) return;

    const endedAt = Date.now();
    const durationSeconds = Math.max(
      0,
      Math.round((endedAt - currentLog.startedAt) / 1000),
    );

    pushDivisionLog({
      id: currentLog.id,
      startedAt: currentLog.startedAt,
      endedAt,
      durationSeconds,
      difficulty: currentLog.difficulty,
      dividendDigits: currentLog.dividendDigits,
      divisorDigits: currentLog.divisorDigits,
      dividendo: currentLog.dividendo,
      divisore: currentLog.divisore,
      correctResult: currentLog.dividendo / currentLog.divisore,
      userAnswer: params.userAnswer,
      status: params.status,
      reason: params.reason,
      wrongAttempts: currentLog.wrongAttempts,
      hintsUsed: currentLog.hintsUsed,
      divisionChangesUsed:
        params.divisionChangesUsed ?? currentLog.divisionChangesUsed,
      scoreBefore: currentLog.scoreBefore,
      scoreAfter: params.scoreAfter,
      rewardsBefore: currentLog.rewardsBefore,
      rewardsAfter: params.rewardsAfter,
      timeLeftAtEnd: Math.max(0, params.timeLeftAtEnd),
    });

    activeDivisionLogRef.current = null;
  };

  // --- SUONI ---
  const [playSuccess] = useSound(successSfx);
  const [playError] = useSound(errorSfx);
  const [playGift] = useSound(Gift);
  const [playSuperGift] = useSound(SuperGift);

  // --- VIBRAZIONE ---
  const { vibrate } = useVibration();

  // --- GAME STATE OBJECT ---
  const gameState: GameState = {
    randomDividendo,
    randomDivisore,
    userAnswer,
    message,
    hint,
    divisionSolved,
    shake,
    score,
    rewards,
    streak,
    bestStreak,
    correctAnswers,
    wrongAnswers,
    difficulty,
    dividendDigits,
    divisorDigits,
    avatarKey,
    playerName,
    divisionChangesUsed,
    timeLeft,
    isTimerActive,
    isHydrated,
  };

  // --- GAME ACTIONS OBJECT ---
  const gameActions: GameActions = {
    setRandomDividendo,
    setRandomDivisore,
    setUserAnswer,
    setMessage,
    setHint,
    setDivisionSolved,
    setShake,
    setScore,
    setRewards,
    setStreak,
    setBestStreak,
    setCorrectAnswers,
    setWrongAnswers,
    setDifficulty,
    setDividendDigits,
    setDivisorDigits,
    setAvatarKey,
    setPlayerName,
    setDivisionChangesUsed,
    setTimeLeft,
    setIsTimerActive,
    setIsHydrated,
  };

  // --- HOOKS ---
  usePersistence(gameState, gameActions);

  useEffect(() => {
    try {
      const rawLogs = localStorage.getItem(DIVISION_LOG_STORAGE_KEY);
      if (!rawLogs) return;
      const parsedLogs = JSON.parse(rawLogs) as DivisionLogEntry[];
      if (Array.isArray(parsedLogs)) {
        setDivisionLogs(parsedLogs.slice(0, MAX_DIVISION_LOG_ENTRIES));
      }
    } catch {
      localStorage.removeItem(DIVISION_LOG_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      DIVISION_LOG_STORAGE_KEY,
      JSON.stringify(divisionLogs),
    );
  }, [divisionLogs]);

  useEffect(() => {
    userAnswerRef.current = userAnswer;
  }, [userAnswer]);

  // AI Adattivo
  const adaptiveResult = useAdaptiveDifficulty(difficulty, {
    correctAnswers,
    wrongAnswers,
    streak,
    bestStreak,
  });

  const handleUnlockSettings = () => {
    if (unlockPasswordInput === SETTINGS_UNLOCK_PASSWORD) {
      setIsSettingsLocked(false);
      setUnlockPasswordInput("");
      setUnlockError("");
      setMessage("🔓 Impostazioni sbloccate");
      return;
    }

    setUnlockError("Password non corretta");
  };

  // --- EFETTI ---
  useEffect(() => {
    if (divisorDigits > dividendDigits) {
      setDivisorDigits(dividendDigits);
    }
  }, [dividendDigits, divisorDigits]);

  useEffect(() => {
    if (!isSettingsLocked) return;

    if (difficulty !== "medium") {
      setDifficulty("medium");
    }

    if (dividendDigits !== 3) {
      setDividendDigits(3);
    }

    if (divisorDigits !== 2) {
      setDivisorDigits(2);
    }
  }, [isSettingsLocked, difficulty, dividendDigits, divisorDigits]);

  useEffect(() => {
    if (isSettingsLocked) return;

    if (difficulty === "easy") {
      const preset = digitPresetByDifficulty.easy;

      if (
        dividendDigits !== preset.dividendDigits ||
        divisorDigits !== preset.divisorDigits
      ) {
        setDividendDigits(preset.dividendDigits);
        setDivisorDigits(preset.divisorDigits);
      }

      return;
    }

    if (difficulty === "medium" && dividendDigits < 2) {
      setDividendDigits(2);
    }
  }, [difficulty, dividendDigits, divisorDigits, isSettingsLocked]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isSettingsLocked) return;

    const preset = digitPresetByDifficulty[difficulty];
    setDividendDigits(preset.dividendDigits);
    setDivisorDigits(preset.divisorDigits);
  }, [difficulty, isHydrated, isSettingsLocked]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isTimerActive || divisionSolved || randomDividendo === 0) return;
    if (activeDivisionLogRef.current) return;

    startDivisionLog({
      dividendo: randomDividendo,
      divisore: randomDivisore,
      difficulty,
      dividendDigits,
      divisorDigits,
    });
  }, [
    isHydrated,
    isTimerActive,
    divisionSolved,
    randomDividendo,
    randomDivisore,
    difficulty,
    dividendDigits,
    divisorDigits,
  ]);

  // --- TIMER LOOP ---
  useEffect(() => {
    if (!isTimerActive) return;

    if (timeLeft <= 0) {
      const scoreAfterTimeout = rewards > 0 ? Math.max(0, score - 1) : score;

      finalizeDivisionLog({
        status: "not-completed",
        reason: "timeout",
        userAnswer: userAnswerRef.current,
        scoreAfter: scoreAfterTimeout,
        rewardsAfter: rewards,
        timeLeftAtEnd: 0,
      });

      setMessage("⏰ Tempo scaduto!");
      setWrongAnswers((w) => w + 1);
      setStreak(0);

      // ⏰ Togli punti SOLO se hai già vinto almeno 1 stella (rewards > 0)
      if (rewards > 0) {
        setScore((s) => Math.max(0, s - 1));
      }

      setDivisionChangesUsed(0);
      setIsTimerActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, rewards, score]);

  // --- GENERA DIVISIONE ---
  const generateDivisionHandler = () => {
    const isActiveUnsolvedDivision =
      isTimerActive && randomDividendo > 0 && !divisionSolved;

    if (isActiveUnsolvedDivision && divisionChangesUsed >= 3) {
      setMessage("⛔ Hai finito i 3 cambi. Risolvi questa divisione!");
      return;
    }

    if (isActiveUnsolvedDivision) {
      finalizeDivisionLog({
        status: "not-completed",
        reason: "changed-division",
        userAnswer,
        scoreAfter: score,
        rewardsAfter: rewards,
        timeLeftAtEnd: timeLeft,
        divisionChangesUsed: divisionChangesUsed + 1,
      });

      setDivisionChangesUsed((count) => count + 1);
    } else {
      setDivisionChangesUsed(0);
    }

    // 🔄 RETRY INTELLIGENTE - finché non trova una combinazione valida
    let result = null;
    let retryCount = 0;
    let currentDividendDigits = dividendDigits;
    let currentDivisorDigits = divisorDigits;

    while (!result?.isValid && retryCount < 5) {
      const digitsForGeneration =
        difficulty === "easy"
          ? digitPresetByDifficulty.easy
          : {
              dividendDigits: currentDividendDigits,
              divisorDigits: currentDivisorDigits,
            };

      result = generateDivision({
        dividendDigits: digitsForGeneration.dividendDigits,
        divisorDigits: digitsForGeneration.divisorDigits,
        maxQuotient: maxQuotientByDifficulty[difficulty],
        minQuotient: minQuotientByDifficulty[difficulty],
      });

      // Se invalido, riduci leggermente le cifre per la prossima iterazione
      if (!result.isValid && currentDividendDigits > 2) {
        currentDividendDigits = Math.max(2, currentDividendDigits - 1);
        currentDivisorDigits = Math.max(1, currentDivisorDigits - 1);
      }

      retryCount++;
    }

    // Se ancora invalido dopo retry, fallback a easy
    if (!result?.isValid) {
      result = generateDivision({
        dividendDigits: 2,
        divisorDigits: 1,
        maxQuotient: 9,
        minQuotient: 3,
      });
    }

    // Ora è garantito che result.isValid === true
    flushSync(() => {
      setRandomDivisore(result.divisore);
      setRandomDividendo(result.dividendo);
      setUserAnswer("");
      setMessage("");
      setHint("");
      setDivisionSolved(false);
      setTimeLeft(timerByDifficulty[difficulty]);
      setIsTimerActive(true);
    });

    startDivisionLog({
      dividendo: result.dividendo,
      divisore: result.divisore,
      difficulty,
      dividendDigits:
        difficulty === "easy"
          ? digitPresetByDifficulty.easy.dividendDigits
          : currentDividendDigits,
      divisorDigits:
        difficulty === "easy"
          ? digitPresetByDifficulty.easy.divisorDigits
          : currentDivisorDigits,
    });
  };

  // --- CONTROLLA RISULTATO ---
  const checkResultHandler = () => {
    if (!randomDividendo) return;

    if (divisionSolved) {
      setMessage("⚠️ Hai già risolto! Fai una nuova divisione.");
      return;
    }

    const correct = randomDividendo / randomDivisore;
    const user = parseInt(userAnswer);

    if (user === correct) {
      playSuccess();
      vibrate("success");

      setMessage(
        `🎉 Bravissim${playerName ? "a" : "o"}${playerName ? ` ${playerName}` : ""}!`,
      );
      confetti({ particleCount: 150, spread: 70 });

      // ✅ SINCRONIZZA TUTTO PER RENDERE IL PULSANTE SUBITO RESPONSIVO
      let newStreakValue = 0;
      let willGainReward = false;
      let willSuperStreak = false;
      let newScoreValue = 0;

      flushSync(() => {
        setDivisionSolved(true);
        setIsTimerActive(false);
        setUserAnswer("");
        setDivisionChangesUsed(0);

        setStreak((prev) => {
          newStreakValue = prev + 1;
          if (newStreakValue > bestStreak) {
            setBestStreak(newStreakValue);
          }
          return newStreakValue;
        });

        setCorrectAnswers((c) => c + 1);

        setScore((prevScore) => {
          newScoreValue = prevScore + 1;
          if (newScoreValue >= 10) {
            setRewards((r) => r + 1);
            willGainReward = true;
            return 0;
          } else {
            return newScoreValue;
          }
        });

        if (newStreakValue === 10) {
          willSuperStreak = true;
        }
      });

      finalizeDivisionLog({
        status: "completed",
        reason: "correct-answer",
        userAnswer,
        scoreAfter: willGainReward ? 0 : newScoreValue,
        rewardsAfter: rewards + (willGainReward ? 1 : 0),
        timeLeftAtEnd: timeLeft,
      });

      // Audio/Confetti DOPO il sync
      if (willGainReward) {
        confetti({
          particleCount: 600,
          spread: 180,
        });
        playSuperGift();
        alert("🎁 Hai guadagnato una stella!");
      } else {
        playGift();
      }

      if (willSuperStreak) {
        confetti({ particleCount: 1000, spread: 200 });
        playSuperGift();
        alert("🔥 SUPER STREAK!");
      }
    } else {
      playError();
      vibrate("error");

      setMessage(`❌ Riprova! ${randomDivisore} × ? = ${randomDividendo}`);

      setShake(true);
      setTimeout(() => setShake(false), 300);

      setStreak(0);
      setWrongAnswers((w) => w + 1);

      if (activeDivisionLogRef.current) {
        activeDivisionLogRef.current.wrongAttempts += 1;
      }

      // ❌ Togli punti SOLO se:
      // - Hai già vinto almeno 1 stella (rewards > 0)
      // - NON sei al livello EASY
      if (rewards > 0 && difficulty !== "easy") {
        setScore((s) => Math.max(0, s - 1));
      }
    }
  };

  // --- HINT HANDLER ---
  const handleHint = () => {
    const aiHint = generateAiHint({
      dividend: randomDividendo,
      divisor: randomDivisore,
      userAnswer,
      difficulty,
      timeLeft,
      wrongAnswers,
      streak,
    });

    setHint(aiHint);

    if (activeDivisionLogRef.current) {
      activeDivisionLogRef.current.hintsUsed += 1;
    }
  };

  const selectedAvatarImage =
    avatarKey === "avatarF" ? avatarFImage : avatarMImage;

  return (
    <motion.div
      className="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AvatarDisplay
        avatarSrc={selectedAvatarImage}
        avatarAlt="avatar selezionato"
        message={message}
        playerName={playerName}
      />

      <PlayerNameInput playerName={playerName} onNameChange={setPlayerName} />

      <AvatarPicker
        selectedAvatar={avatarKey}
        onAvatarSelect={setAvatarKey}
        avatarF={avatarFImage}
        avatarM={avatarMImage}
      />

      <AwardsCard rewards={rewards} />

      <ProgressCard score={score} />

      <StatsCard
        streak={streak}
        bestStreak={bestStreak}
        correctAnswers={correctAnswers}
        wrongAnswers={wrongAnswers}
      />

      <AIAnalytics
        accuracy={adaptiveResult.currentAccuracy}
        streak={streak}
        bestStreak={bestStreak}
        correctAnswers={correctAnswers}
        wrongAnswers={wrongAnswers}
        difficulty={difficulty}
      />

      <DifficultySettings
        difficulty={difficulty}
        dividendDigits={dividendDigits}
        divisorDigits={divisorDigits}
        isLocked={isSettingsLocked}
        unlockPassword={unlockPasswordInput}
        unlockError={unlockError}
        onDifficultyChange={setDifficulty}
        onDividendDigitsChange={setDividendDigits}
        onDivisorDigitsChange={setDivisorDigits}
        onUnlockPasswordChange={(value) => {
          setUnlockPasswordInput(value);
          if (unlockError) setUnlockError("");
        }}
        onUnlock={handleUnlockSettings}
      />

      <AdaptiveSuggestion
        accuracy={adaptiveResult.currentAccuracy}
        suggestedDifficulty={adaptiveResult.suggestedDifficulty}
        currentDifficulty={difficulty}
        shouldAutoUpgrade={adaptiveResult.shouldAutoUpgrade}
        shouldAutoDowngrade={adaptiveResult.shouldAutoDowngrade}
        message={adaptiveResult.message}
        confidence={adaptiveResult.confidence}
      />

      <DivisionDisplay
        dividendo={randomDividendo}
        divisore={randomDivisore}
        shake={shake}
      />

      <TimerDisplay timeLeft={timeLeft} />

      <ResultInput
        userAnswer={userAnswer}
        isTimerActive={isTimerActive}
        onAnswerChange={setUserAnswer}
        onEnter={checkResultHandler}
      />

      <GameButtons
        isTimerActive={isTimerActive}
        divisionSolved={divisionSolved}
        divisionChangesUsed={divisionChangesUsed}
        onCheck={checkResultHandler}
        onHint={handleHint}
        onNewDivision={generateDivisionHandler}
      />

      <HintDisplay hint={hint} />

      <MessageDisplay message={message} streak={streak} />

      <DivisionLogCard logs={divisionLogs} />
    </motion.div>
  );
}

export default App;
