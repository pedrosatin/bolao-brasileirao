export type ScoreInput = {
  predictedHome: number;
  predictedAway: number;
  actualHome: number;
  actualAway: number;
};

export const SCORING_RULES = {
  exactScore: 3,
  correctOutcome: 1,
  wrongOutcome: 0
};

// Centralized scoring logic for easy maintenance.
export function calculatePoints(input: ScoreInput): number {
  const { predictedHome, predictedAway, actualHome, actualAway } = input;

  if (predictedHome === actualHome && predictedAway === actualAway) {
    return SCORING_RULES.exactScore;
  }

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  if (predictedDiff === 0 && actualDiff === 0) {
    return SCORING_RULES.correctOutcome;
  }

  if ((predictedDiff > 0 && actualDiff > 0) || (predictedDiff < 0 && actualDiff < 0)) {
    return SCORING_RULES.correctOutcome;
  }

  return SCORING_RULES.wrongOutcome;
}
