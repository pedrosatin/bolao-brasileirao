import { describe, it, expect } from 'vitest';
import { hasMatchStarted } from './date';

describe('hasMatchStarted', () => {
  it('should return false if utcDate is not provided', () => {
    expect(hasMatchStarted('')).toBe(false);
  });

  it('should return true if utcDate is an invalid date string', () => {
    expect(hasMatchStarted('invalid-date')).toBe(true);
  });

  it('should return true if the reference date is exactly at the match start time', () => {
    const matchDate = '2024-05-15T20:00:00Z';
    const referenceDate = new Date('2024-05-15T20:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(true);
  });

  it('should return true if the reference date is past the match start time', () => {
    const matchDate = '2024-05-15T20:00:00Z';
    const referenceDate = new Date('2024-05-15T21:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(true);
  });

  it('should return false if the reference date is before the match start time', () => {
    const matchDate = '2024-05-15T20:00:00Z';
    const referenceDate = new Date('2024-05-15T19:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(false);
  });

  it('should use the current time if no reference date is provided', () => {
    // We can't mock Date entirely without making tests complex, but we know what should happen
    // based on future and past dates relative to real-world time.

    // Future match -> hasn't started
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(hasMatchStarted(futureDate.toISOString())).toBe(false);

    // Past match -> has started
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(hasMatchStarted(pastDate.toISOString())).toBe(true);
  });
});
