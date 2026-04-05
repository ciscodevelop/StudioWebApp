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
  const dividendOptions = difficulty === "medium" ? [2, 3, 4] : [1, 2, 3, 4];

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
            {dividendOptions.map((digits) => (
              <option key={digits} value={digits}>
                {digits}
              </option>
            ))}
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
          In facile il preset è fisso: divisore a 1 cifra e dividendo a 2 cifre.
          Per cambiare le cifre usa medio o difficile.
        </p>
      )}
    </div>
  );
};
