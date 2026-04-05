import { DifficultyLevel } from "../types/game.types";

interface AiHintOptions {
  dividend: number;
  divisor: number;
  userAnswer: string;
  difficulty: DifficultyLevel;
  timeLeft: number;
  wrongAnswers: number;
  streak: number;
}

const getDirectionHint = (guess: number, correctAnswer: number) => {
  if (guess === correctAnswer) {
    return "La risposta che hai scritto e gia giusta.";
  }

  return guess > correctAnswer
    ? "Il numero che hai scritto e troppo alto: prova a scendere un po'."
    : "Il numero che hai scritto e troppo basso: prova a salire un po'.";
};

const buildDivisionStrategy = (dividend: number, divisor: number) => {
  const quotient = dividend / divisor;

  if (quotient <= 10) {
    return `Pensa alla tabellina: ${divisor} x ? = ${dividend}.`;
  }

  const tensPart = Math.floor(quotient / 10) * 10;
  const tensValue = divisor * tensPart;
  const remaining = dividend - tensValue;
  const unitsPart = remaining / divisor;

  if (tensPart > 0 && Number.isInteger(unitsPart) && unitsPart >= 0) {
    return `Spezzala cosi: ${divisor} x ${tensPart} = ${tensValue}. Restano ${remaining}. Poi ${divisor} x ${unitsPart} = ${remaining}. Quindi ${tensPart} + ${unitsPart} = ${quotient}.`;
  }

  return `Cerca il numero che moltiplicato per ${divisor} ti riporta a ${dividend}.`;
};

const getDifficultyCoaching = (difficulty: DifficultyLevel) => {
  if (difficulty === "easy") {
    return "Usa la tabellina e controlla con calma i gruppi uguali.";
  }

  if (difficulty === "medium") {
    return "Dividi il problema in due pezzi facili e poi somma i risultati.";
  }

  return "Stima prima il risultato e poi rifinisci con una moltiplicazione di controllo.";
};

export const generateAiHint = ({
  dividend,
  divisor,
  userAnswer,
  difficulty,
  timeLeft,
  wrongAnswers,
  streak,
}: AiHintOptions) => {
  if (!dividend || !divisor) {
    return "Tutor AI: genera prima una divisione e poi ti aiuto passo passo.";
  }

  const correctAnswer = dividend / divisor;
  const trimmedAnswer = userAnswer.trim();
  const guess = trimmedAnswer ? Number.parseInt(trimmedAnswer, 10) : Number.NaN;

  const parts = [
    `Tutor AI: guarda ${dividend} ÷ ${divisor}.`,
    buildDivisionStrategy(dividend, divisor),
    getDifficultyCoaching(difficulty),
  ];

  if (!Number.isNaN(guess)) {
    parts.push(getDirectionHint(guess, correctAnswer));
  } else {
    parts.push(
      "Se vuoi, scrivi un tentativo: poi ti dico se sei troppo alto o troppo basso.",
    );
  }

  if (timeLeft <= 5) {
    parts.push(
      "Manca poco tempo: fai una moltiplicazione veloce per controllare.",
    );
  }

  if (wrongAnswers > 0 && streak === 0) {
    parts.push(
      "Respira e riparti dal divisore: costruisci il risultato un pezzo alla volta.",
    );
  }

  return parts.join(" ");
};
