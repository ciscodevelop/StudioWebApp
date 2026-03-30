import "./App.css";
import { useState, useEffect } from "react";
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
  PersistedGameState,
} from "./types/game.types";
import {
  timerByDifficulty,
  maxQuotientByDifficulty,
  digitPresetByDifficulty,
} from "./constants/game.constants";

// Utils
import { generateDivision } from "./utils/math.utils";

// Images & Sounds
import avatarFImage from "./images/avatar/avatarF.png";
import avatarMImage from "./images/avatar/avatarM.png";
import successSfx from "./sounds/success.wav";
import errorSfx from "./sounds/error.wav";
import Gift from "./sounds/success.wav";
import SuperGift from "./sounds/success.wav";

function App() {
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
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");
  const [dividendDigits, setDividendDigits] = useState(2);
  const [divisorDigits, setDivisorDigits] = useState(1);
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("avatarF");
  const [playerName, setPlayerName] = useState("");
  const [divisionChangesUsed, setDivisionChangesUsed] = useState(0);

  // --- TIMER ---
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
  };

  // --- HOOKS ---
  usePersistence(gameState, gameActions);

  // AI Adattivo
  const adaptiveResult = useAdaptiveDifficulty(difficulty, {
    correctAnswers,
    wrongAnswers,
    streak,
    bestStreak,
  });

  // --- EFETTI ---
  useEffect(() => {
    if (divisorDigits > dividendDigits) {
      setDivisorDigits(dividendDigits);
    }
  }, [dividendDigits, divisorDigits]);

  useEffect(() => {
    if (!isHydrated) return;

    const preset = digitPresetByDifficulty[difficulty];
    setDividendDigits(preset.dividendDigits);
    setDivisorDigits(preset.divisorDigits);
  }, [difficulty, isHydrated]);

  // --- TIMER LOOP ---
  useEffect(() => {
    if (!isTimerActive) return;

    if (timeLeft <= 0) {
      setMessage("⏰ Tempo scaduto!");
      setWrongAnswers((w) => w + 1);
      setStreak(0);
      setScore((s) => Math.max(0, s - 1));
      setDivisionChangesUsed(0);
      setIsTimerActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive]);

  // --- GENERA DIVISIONE ---
  const generateDivisionHandler = () => {
    const isActiveUnsolvedDivision =
      isTimerActive && randomDividendo > 0 && !divisionSolved;

    if (isActiveUnsolvedDivision && divisionChangesUsed >= 3) {
      setMessage("⛔ Hai finito i 3 cambi. Risolvi questa divisione!");
      return;
    }

    if (isActiveUnsolvedDivision) {
      setDivisionChangesUsed((count) => count + 1);
    } else {
      setDivisionChangesUsed(0);
    }

    const result = generateDivision({
      dividendDigits,
      divisorDigits,
      maxQuotient: maxQuotientByDifficulty[difficulty],
    });

    if (!result.isValid) {
      setMessage("⚠️ Combinazione non valida, cambia cifre o livello.");
      return;
    }

    setRandomDivisore(result.divisore);
    setRandomDividendo(result.dividendo);
    setUserAnswer("");
    setMessage("");
    setHint("");
    setDivisionSolved(false);
    setTimeLeft(timerByDifficulty[difficulty]);
    setIsTimerActive(true);
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

      setDivisionSolved(true);
      setIsTimerActive(false);
      setUserAnswer("");
      setDivisionChangesUsed(0);

      let newStreakValue = 0;

      setStreak((prev) => {
        newStreakValue = prev + 1;

        if (newStreakValue > bestStreak) {
          setBestStreak(newStreakValue);
        }

        return newStreakValue;
      });

      setCorrectAnswers((c) => c + 1);

      const newScore = score + 1;
      if (newScore >= 10) {
        setScore(0);
        setRewards((r) => r + 1);

        confetti({
          particleCount: 600,
          spread: 180,
        });
        playSuperGift();
        alert("🎁 Hai guadagnato una stella!");
      } else {
        playGift();
        setScore(newScore);
      }

      if (newStreakValue === 10) {
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
      setScore((s) => Math.max(0, s - 1));
    }
  };

  // --- HINT HANDLER ---
  const handleHint = () => {
    setHint(`Tabellina del ${randomDivisore}`);
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
        onDifficultyChange={setDifficulty}
        onDividendDigitsChange={setDividendDigits}
        onDivisorDigitsChange={setDivisorDigits}
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
    </motion.div>
  );
}

export default App;
