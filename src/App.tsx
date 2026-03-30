import "./App.css";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import useSound from "use-sound";

import avatarImage from './images/avatar/avatarF.png';
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

  // --- TIMER ---
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // --- SUONI ---
  const [playSuccess] = useSound(successSfx);
  const [playError] = useSound(errorSfx);
  const [playGift] = useSound(Gift);
  const [playSuperGift] = useSound(SuperGift);

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
    let maxNumber = 10;

    if (streak > 5) maxNumber = 20;
    if (streak > 10) maxNumber = 50;

    const divisore = Math.floor(Math.random() * maxNumber) + 2;
    const risultato = Math.floor(Math.random() * maxNumber) + 1;
    const dividendo = divisore * risultato;

    setRandomDivisore(divisore);
    setRandomDividendo(dividendo);
    setUserAnswer("");
    setMessage("");
    setHint("");
    setDivisionSolved(false);

    // TIMER RESET
    setTimeLeft(10);
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

      setMessage("🎉 Bravissima!");
      confetti({ particleCount: 150, spread: 70 });

      setDivisionSolved(true);
      setIsTimerActive(false);
      setUserAnswer("");

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
    }
  };

  return (
    <motion.div
      className="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* AVATAR */}
      <div className="avatar">
        <img src={avatarImage} alt="avatar" />
        <p>
          {message.includes("🎉")
            ? "Brava!! 😍"
            : message.includes("❌")
              ? "Dai 💪"
              : "Proviamo! ✨"}
        </p>
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

      {/* TIMER */}
      <div className="card">⏱️ {timeLeft}s</div>

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

      {/* INPUT */}
      <div className="card input-container">
        <input
          className="input"
          value={userAnswer}
          disabled={!isTimerActive}
          onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
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

      <button className="btn primary" onClick={generateDivision}>
        Nuova Divisione
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
