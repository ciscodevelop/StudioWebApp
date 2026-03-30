import { DifficultyLevel } from "../types/game.types";

interface DifficultySettingsProps {
  difficulty: DifficultyLevel;
  dividendDigits: number;
  divisorDigits: number;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onDividendDigitsChange: (digits: number) => void;
  onDivisorDigitsChange: (digits: number) => void;
}

export const DifficultySettings = ({
  difficulty,
  dividendDigits,
  divisorDigits,
  onDifficultyChange,
  onDividendDigitsChange,
  onDivisorDigitsChange,
}: DifficultySettingsProps) => {
  return (
    <div className="card settings-card">
      <h2>⚙️ Impostazioni</h2>

      <div className="settings-grid">
        <label className="setting-item">
          Livello
          <select
            className="setting-select"
            value={difficulty}
            onChange={(e) =>
              onDifficultyChange(e.target.value as DifficultyLevel)
            }
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
            onChange={(e) =>
              onDividendDigitsChange(parseInt(e.target.value, 10))
            }
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
            onChange={(e) =>
              onDivisorDigitsChange(parseInt(e.target.value, 10))
            }
          >
            {Array.from({ length: Math.min(3, dividendDigits) }, (_, index) => {
              const digits = index + 1;
              return (
                <option key={digits} value={digits}>
                  {digits}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {difficulty === "easy" && (
        <p>
          In facile il divisore è a 1 cifra e il dividendo varia tra 2 e 3
          cifre.
        </p>
      )}
    </div>
  );
};
