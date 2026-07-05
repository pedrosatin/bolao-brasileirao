import { describe, it, expect } from 'vitest';
import { calculatePoints, SCORING_RULES } from './scoring';

describe('calculatePoints', () => {
  describe('exactScore (3 points)', () => {
    it('returns exactScore points when predicted exactly matches actual (home win)', () => {
      const input = { predictedHome: 2, predictedAway: 1, actualHome: 2, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.exactScore);
    });

    it('returns exactScore points when predicted exactly matches actual (away win)', () => {
      const input = { predictedHome: 0, predictedAway: 2, actualHome: 0, actualAway: 2 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.exactScore);
    });

    it('returns exactScore points when predicted exactly matches actual (draw)', () => {
      const input = { predictedHome: 1, predictedAway: 1, actualHome: 1, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.exactScore);
    });

    it('returns exactScore points when predicted exactly matches actual (0-0)', () => {
      const input = { predictedHome: 0, predictedAway: 0, actualHome: 0, actualAway: 0 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.exactScore);
    });
  });

  describe('correctOutcome (1 point)', () => {
    it('returns correctOutcome points when predicted home win, actual home win, but different scores', () => {
      const input = { predictedHome: 2, predictedAway: 0, actualHome: 3, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.correctOutcome);
    });

    it('returns correctOutcome points when predicted away win, actual away win, but different scores', () => {
      const input = { predictedHome: 0, predictedAway: 1, actualHome: 1, actualAway: 2 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.correctOutcome);
    });

    it('returns correctOutcome points when predicted draw, actual draw, but different scores', () => {
      const input = { predictedHome: 0, predictedAway: 0, actualHome: 1, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.correctOutcome);
    });

    it('returns correctOutcome points when predicted home win by small margin, actual home win by large margin', () => {
      const input = { predictedHome: 2, predictedAway: 1, actualHome: 4, actualAway: 0 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.correctOutcome);
    });
  });

  describe('wrongOutcome (0 points)', () => {
    it('returns wrongOutcome points when predicted home win but actual was away win', () => {
      const input = { predictedHome: 2, predictedAway: 1, actualHome: 1, actualAway: 2 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });

    it('returns wrongOutcome points when predicted home win but actual was draw', () => {
      const input = { predictedHome: 2, predictedAway: 1, actualHome: 1, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });

    it('returns wrongOutcome points when predicted away win but actual was home win', () => {
      const input = { predictedHome: 0, predictedAway: 2, actualHome: 1, actualAway: 0 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });

    it('returns wrongOutcome points when predicted away win but actual was draw', () => {
      const input = { predictedHome: 0, predictedAway: 1, actualHome: 2, actualAway: 2 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });

    it('returns wrongOutcome points when predicted draw but actual was home win', () => {
      const input = { predictedHome: 1, predictedAway: 1, actualHome: 2, actualAway: 1 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });

    it('returns wrongOutcome points when predicted draw but actual was away win', () => {
      const input = { predictedHome: 1, predictedAway: 1, actualHome: 0, actualAway: 2 };
      expect(calculatePoints(input)).toBe(SCORING_RULES.wrongOutcome);
    });
  });
});
