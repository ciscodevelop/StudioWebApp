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
}) => {
  const { dividendDigits, divisorDigits, maxQuotient } = options;

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

  return {
    dividendo,
    divisore,
    isValid: foundValidDivision,
  };
};
