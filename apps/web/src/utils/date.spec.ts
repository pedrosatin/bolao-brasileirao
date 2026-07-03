import { describe, it, expect } from 'vitest';
import { hasMatchStarted } from './date';

describe('hasMatchStarted', () => {
  it('returns false when utcDate is empty', () => {
    expect(hasMatchStarted('')).toBe(false);
  });

  it('returns true when utcDate is invalid', () => {
    expect(hasMatchStarted('invalid-date')).toBe(false);
  });

  it('returns true when match date is in the past compared to reference date', () => {
    const matchDate = '2023-01-01T12:00:00Z';
    const referenceDate = new Date('2023-01-01T13:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(true);
  });

  it('returns false when match date is in the future compared to reference date', () => {
    const matchDate = '2023-01-01T14:00:00Z';
    const referenceDate = new Date('2023-01-01T13:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(false);
  });

  it('returns true when match date is exactly the reference date', () => {
    const matchDate = '2023-01-01T13:00:00Z';
    const referenceDate = new Date('2023-01-01T13:00:00Z');
    expect(hasMatchStarted(matchDate, referenceDate)).toBe(true);
  });

  it('uses current date when reference date is not provided', () => {
    // A date in the past
    const pastMatchDate = new Date(Date.now() - 10000).toISOString();
    expect(hasMatchStarted(pastMatchDate)).toBe(true);

    // A date in the future
    const futureMatchDate = new Date(Date.now() + 10000).toISOString();
    expect(hasMatchStarted(futureMatchDate)).toBe(false);
  });
});
