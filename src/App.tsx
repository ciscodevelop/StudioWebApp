import "./App.css";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import useSound from "use-sound";

import avatarFImage from "./images/avatar/avatarF.png";
import avatarMImage from "./images/avatar/avatarM.png";
import successSfx from "./sounds/success.wav";
import errorSfx from "./sounds/error.wav";
import Gift from "./sounds/success.wav";
import SuperGift from "./sounds/success.wav";

const GAME_STORAGE_KEY = "division-game-state-v1";
type DifficultyLevel = "easy" | "medium" | "hard";
type AvatarKey = "avatarF" | "avatarM";

const avatarMap: Record<AvatarKey, string> = {
  avatarF: avatarFImage,
  avatarM: avatarMImage,
};

const timerByDifficulty: Record<DifficultyLevel, number> = {
  easy: 20, // es. 48÷6 → ~30s con carta e penna
  medium: 60, // es. 144÷12 → ~60s
  hard: 120, // es. 576÷24 → ~2 minuti
};

const maxQuotientByDifficulty: Record<DifficultyLevel, number> = {
  easy: 9,
  medium: 30,
  hard: 90,
};

const digitPresetByDifficulty: Record<
  DifficultyLevel,
  { dividendDigits: number; divisorDigits: number }
> = {
  easy: { dividendDigits: 2, divisorDigits: 1 },
  medium: { dividendDigits: 2, divisorDigits: 1 },
  hard: { dividendDigits: 3, divisorDigits: 2 },
};

const getDigitBounds = (digits: number) => {
  if (digits <= 1) {
    return { min: 1, max: 9 };
  }

  return {
    min: 10 ** (digits - 1),
    max: 10 ** digits - 1,
  };
};

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type PersistedGameState = {
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
};

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

  // --- RIPRISTINO STATO DOPO REFRESH ---
  useEffect(() => {
    try {
      const rawState = localStorage.getItem(GAME_STORAGE_KEY);
      if (!rawState) {
        setIsHydrated(true);
        return;
      }

      const savedState = JSON.parse(rawState) as PersistedGameState;

      setRandomDividendo(savedState.randomDividendo || 0);
      setRandomDivisore(savedState.randomDivisore || 0);
      setScore(savedState.score || 0);
      setRewards(savedState.rewards || 0);
      setStreak(savedState.streak || 0);
      setBestStreak(savedState.bestStreak || 0);
      setCorrectAnswers(savedState.correctAnswers || 0);

      const elapsedSeconds = Math.floor(
        (Date.now() - (savedState.lastSavedAt || Date.now())) / 1000,
      );

      if (savedState.isTimerActive) {
        const adjustedTimeLeft = (savedState.timeLeft || 0) - elapsedSeconds;

        if (adjustedTimeLeft <= 0) {
          setTimeLeft(0);
          setIsTimerActive(false);
          setMessage("⏰ Tempo scaduto!");
          setStreak(0);
          setWrongAnswers((savedState.wrongAnswers || 0) + 1);
          setScore(Math.max(0, (savedState.score || 0) - 1));
          setDivisionChangesUsed(0);
        } else {
          setTimeLeft(adjustedTimeLeft);
          setIsTimerActive(true);
          setMessage(savedState.message || "");
          setWrongAnswers(savedState.wrongAnswers || 0);
        }
      } else {
        setTimeLeft(savedState.timeLeft || 10);
        setIsTimerActive(false);
        setMessage(savedState.message || "");
        setWrongAnswers(savedState.wrongAnswers || 0);
      }

      setDivisionSolved(savedState.divisionSolved || false);
      setHint(savedState.hint || "");

      const savedDifficulty = savedState.difficulty || "easy";
      setDifficulty(savedDifficulty);

      const safeDividendDigits = Math.min(
        Math.max(savedState.dividendDigits || 2, 1),
        4,
      );
      const safeDivisorDigits = Math.min(
        Math.max(savedState.divisorDigits || 1, 1),
        safeDividendDigits,
      );

      setDividendDigits(safeDividendDigits);
      setDivisorDigits(safeDivisorDigits);

      setAvatarKey(savedState.avatarKey || "avatarF");
      setPlayerName(savedState.playerName || "");
      setDivisionChangesUsed(savedState.divisionChangesUsed || 0);
    } catch {
      localStorage.removeItem(GAME_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // --- SALVATAGGIO STATO AUTOMATICO ---
  useEffect(() => {
    if (!isHydrated) return;

    const stateToSave: PersistedGameState = {
      randomDividendo,
      randomDivisore,
      score,
      rewards,
      streak,
      bestStreak,
      correctAnswers,
      wrongAnswers,
      timeLeft,
      isTimerActive,
      divisionSolved,
      message,
      hint,
      difficulty,
      dividendDigits,
      divisorDigits,
      avatarKey,
      playerName,
      divisionChangesUsed,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    randomDividendo,
    randomDivisore,
    score,
    rewards,
    streak,
    bestStreak,
    correctAnswers,
    wrongAnswers,
    timeLeft,
    isTimerActive,
    divisionSolved,
    message,
    hint,
    difficulty,
    dividendDigits,
    divisorDigits,
    avatarKey,
    playerName,
    divisionChangesUsed,
    isHydrated,
  ]);

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

  // --- VIBRAZIONE ---
  const vibrate = (type: any) => {
    if (!navigator.vibrate) return;
    type === "success"
      ? navigator.vibrate([100, 50, 100])
      : navigator.vibrate(200);
  };

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
  const generateDivision = () => {
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

    const effectiveDividendDigits =
      divisorDigits === 1 && dividendDigits <= 2
        ? getRandomInt(2, 3)
        : dividendDigits;

    const dividendRange = getDigitBounds(effectiveDividendDigits);
    const divisorRange = getDigitBounds(divisorDigits);
    const minDivisor = Math.max(2, divisorRange.min);
    const maxDivisor = divisorRange.max;
    const maxQuotient = maxQuotientByDifficulty[difficulty];

    let divisore = 0;
    let dividendo = 0;
    let foundValidDivision = false;

    for (let attempt = 0; attempt < 300; attempt += 1) {
      const candidateDivisore = getRandomInt(minDivisor, maxDivisor);
      const minQuotient = Math.max(
        1,
        Math.ceil(dividendRange.min / candidateDivisore),
      );
      const maxAllowedQuotient = Math.min(
        maxQuotient,
        Math.floor(dividendRange.max / candidateDivisore),
      );

      if (minQuotient > maxAllowedQuotient) {
        continue;
      }

      const candidateQuotient = getRandomInt(minQuotient, maxAllowedQuotient);
      const candidateDividendo = candidateDivisore * candidateQuotient;

      divisore = candidateDivisore;
      dividendo = candidateDividendo;
      foundValidDivision = true;
      break;
    }

    if (!foundValidDivision) {
      setMessage("⚠️ Combinazione non valida, cambia cifre o livello.");
      return;
    }

    setRandomDivisore(divisore);
    setRandomDividendo(dividendo);
    setUserAnswer("");
    setMessage("");
    setHint("");
    setDivisionSolved(false);

    // TIMER RESET
    setTimeLeft(timerByDifficulty[difficulty]);
    setIsTimerActive(true);
  };

  // --- CONTROLLA RISULTATO ---
  const checkResult = () => {
    if (!randomDividendo) return;

    // 🔒 FIX BUG punti infiniti
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

      // STREAK
      let newStreakValue = 0;

      setStreak((prev) => {
        newStreakValue = prev + 1;

        if (newStreakValue > bestStreak) {
          setBestStreak(newStreakValue);
        }

        return newStreakValue;
      });

      setCorrectAnswers((c) => c + 1);

      // SCORE
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

      // SUPER STREAK
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

  const selectedAvatarImage = avatarMap[avatarKey] || avatarFImage;
  const normalizedPlayerName = playerName.trim();
  const changesRemaining = Math.max(0, 3 - divisionChangesUsed);

  return (
    <motion.div
      className="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* AVATAR */}
      <div className="avatar">
        <img src={selectedAvatarImage} alt="avatar selezionato" />
        <p>
          {message.includes("🎉")
            ? `${normalizedPlayerName || "Grande"}!! 😍`
            : message.includes("❌")
              ? `${normalizedPlayerName || "Dai"} 💪`
              : `${normalizedPlayerName ? `Forza ${normalizedPlayerName}` : "Proviamo"}! ✨`}
        </p>
      </div>

      {/* NOME GIOCATORE */}
      <div className="card name-card">
        <h2>✍️ Nome</h2>
        <input
          className="name-input"
          type="text"
          value={playerName}
          maxLength={20}
          onChange={(e) =>
            setPlayerName(
              e.target.value.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ\s'-]/g, ""),
            )
          }
          placeholder="Scrivi il tuo nome"
        />
      </div>

      {/* SCELTA AVATAR */}
      <div className="card avatar-picker-card">
        <h2>🧑 Scegli Avatar</h2>
        <div className="avatar-options">
          <button
            type="button"
            className={`avatar-option ${avatarKey === "avatarF" ? "active" : ""}`}
            onClick={() => setAvatarKey("avatarF")}
            aria-label="Scegli avatar F"
          >
            <img src={avatarFImage} alt="Avatar F" />
          </button>

          <button
            type="button"
            className={`avatar-option ${avatarKey === "avatarM" ? "active" : ""}`}
            onClick={() => setAvatarKey("avatarM")}
            aria-label="Scegli avatar M"
          >
            <img src={avatarMImage} alt="Avatar M" />
          </button>
        </div>
      </div>

      {/* PREMI */}
      <div className="card">
        <h2>🏆 Premi</h2>
        <div>{rewards} ⭐</div>
      </div>

      {/* PROGRESS */}
      <div className="card">
        <p>{score} / 10</p>
        <div className="bar">
          <div style={{ width: `${score * 10}%` }} />
        </div>
      </div>

      {/* STATS */}
      <div className="card">
        <p>🔥 Vittorie Consecutive: {streak}</p>
        <p>🏆 Record: {bestStreak}</p>
        <p>
          ✅ {correctAnswers} | ❌ {wrongAnswers}
        </p>
      </div>

      {/* IMPOSTAZIONI */}
      <div className="card settings-card">
        <h2>⚙️ Impostazioni</h2>

        <div className="settings-grid">
          <label className="setting-item">
            Livello
            <select
              className="setting-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            >
              <option value="easy">Facile</option>
              <option value="medium">Medio</option>
              <option value="hard">Difficile</option>
            </select>
          </label>

          <label className="setting-item">
            Cifre dividendo
            <select
              className="setting-select"
              value={dividendDigits}
              disabled={difficulty === "easy"}
              onChange={(e) => setDividendDigits(parseInt(e.target.value, 10))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>

          <label className="setting-item">
            Cifre divisore
            <select
              className="setting-select"
              value={divisorDigits}
              disabled={difficulty === "easy"}
              onChange={(e) => setDivisorDigits(parseInt(e.target.value, 10))}
            >
              {Array.from(
                { length: Math.min(3, dividendDigits) },
                (_, index) => {
                  const digits = index + 1;
                  return (
                    <option key={digits} value={digits}>
                      {digits}
                    </option>
                  );
                },
              )}
            </select>
          </label>
        </div>

        {difficulty === "easy" && (
          <p>
            In facile il divisore e a 1 cifra e il dividendo varia tra 2 e 3
            cifre.
          </p>
        )}
      </div>

      {/* DIVISIONE */}
      <div className={`card ${shake ? "shake" : ""}`}>
        <motion.div
          key={randomDividendo}
          className="division"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
        >
          {randomDividendo || "?"} ÷ {randomDivisore || "?"}
        </motion.div>
      </div>

      {/* TIMER */}
      <div className="card">⏱️ {timeLeft}s</div>

      {/* INPUT */}
      <div className="card input-container">
        <input
          className="input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={userAnswer}
          disabled={!isTimerActive}
          onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              checkResult();
            }
          }}
          placeholder="Risultato"
        />
      </div>

      {/* BOTTONI */}
      <div className="row">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn primary"
          onClick={checkResult}
          disabled={!isTimerActive || divisionSolved}
        >
          Controlla
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn"
          onClick={() => setHint(`Tabellina del ${randomDivisore}`)}
        >
          Aiuto
        </motion.button>
      </div>

      <button
        className="btn primary"
        onClick={generateDivision}
        disabled={isTimerActive && !divisionSolved && divisionChangesUsed >= 3}
      >
        Nuova Divisione ({changesRemaining}/3 cambi)
      </button>

      {hint && <p className="hint">{hint}</p>}

      <h3
        style={{
          color:
            streak > 5
              ? "gold"
              : message.includes("🎉")
                ? "#22c55e"
                : "#ef4444",
        }}
      >
        {message}
      </h3>
    </motion.div>
  );
}

export default App;
