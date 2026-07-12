import { describe, it, expect } from 'vitest';
import { formatDate, hasMatchStarted } from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('formats a valid date string correctly', () => {
      // Create a specific UTC date string
      const dateString = '2024-05-15T20:00:00Z';

      const formatted = formatDate(dateString);

      // Use standard assertions that will work depending on the environment timezone.
      // Since Intl.DateTimeFormat output is timezone-dependent, we just verify format and content loosely.
      // A safer approach is to check if it contains the year and month abbreviation.
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('mai.');
      expect(formatted).toMatch(/\d{2}:\d{2}/); // Contains time in HH:MM format
    });

    it('throws RangeError for an invalid date string', () => {
      expect(() => formatDate('invalid-date')).toThrow(RangeError);
    });
  });

  describe('hasMatchStarted', () => {
    it('returns false for empty string', () => {
      expect(hasMatchStarted('')).toBe(false);
    });

    it('returns false for invalid date string', () => {
      expect(hasMatchStarted('invalid-date')).toBe(false);
    });

    it('returns true if current time is after match time', () => {
      const matchDate = new Date('2024-01-01T12:00:00Z');
      const referenceDate = new Date('2024-01-01T13:00:00Z');

      expect(hasMatchStarted(matchDate.toISOString(), referenceDate)).toBe(true);
    });

    it('returns false if current time is before match time', () => {
      const matchDate = new Date('2024-01-01T12:00:00Z');
      const referenceDate = new Date('2024-01-01T11:00:00Z');

      expect(hasMatchStarted(matchDate.toISOString(), referenceDate)).toBe(false);
    });

    it('returns true if current time is exactly match time', () => {
      const matchDate = new Date('2024-01-01T12:00:00Z');
      const referenceDate = new Date('2024-01-01T12:00:00Z');

      expect(hasMatchStarted(matchDate.toISOString(), referenceDate)).toBe(true);
    });
  });
});
