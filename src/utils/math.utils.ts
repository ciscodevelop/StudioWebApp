export const getDigitBounds = (digits: number) => {
  if (digits <= 1) {
    return { min: 1, max: 9 };
  }

  return {
    min: 10 ** (digits - 1),
    max: 10 ** digits - 1,
  };
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateDivision = (options: {
  dividendDigits: number;
  divisorDigits: number;
  maxQuotient: number;
  minQuotient?: number; // ✅ Nuovo parametro opzionale
}) => {
  const {
    dividendDigits,
    divisorDigits,
    maxQuotient,
    minQuotient = 2,
  } = options;

  const effectiveDividendDigits =
    divisorDigits === 1 && dividendDigits <= 2
      ? getRandomInt(2, 3)
      : dividendDigits;

  const dividendRange = getDigitBounds(effectiveDividendDigits);
  const divisorRange = getDigitBounds(divisorDigits);
  const minDivisor = Math.max(2, divisorRange.min);
  const maxDivisor = divisorRange.max;

  let divisore = 0;
  let dividendo = 0;
  let foundValidDivision = false;

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const candidateDivisore = getRandomInt(minDivisor, maxDivisor);
    const calculatedMinQuotient = Math.max(
      minQuotient, // ✅ Usa il parametro minQuotient
      Math.ceil(dividendRange.min / candidateDivisore),
    );
    const maxAllowedQuotient = Math.min(
      maxQuotient,
      Math.floor(dividendRange.max / candidateDivisore),
    );

    if (calculatedMinQuotient > maxAllowedQuotient) {
      continue;
    }

    const candidateQuotient = getRandomInt(
      calculatedMinQuotient,
      maxAllowedQuotient,
    );
    const candidateDividendo = candidateDivisore * candidateQuotient;

    // ✅ Verifica esplicita: dividendo NON deve mai essere uguale a divisore
    if (candidateDividendo === candidateDivisore) {
      continue;
    }

    divisore = candidateDivisore;
    dividendo = candidateDividendo;
    foundValidDivision = true;
    break;
  }

  return {
    dividendo,
    divisore,
    isValid: foundValidDivision,
  };
};
