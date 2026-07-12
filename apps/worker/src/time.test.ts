import { describe, it, expect } from 'vitest';
import { hasMatchStartedInBrasilia } from './time';

describe('hasMatchStartedInBrasilia', () => {
  it('returns true when utcDate is empty', () => {
    expect(hasMatchStartedInBrasilia('')).toBe(true);
  });

  it('returns true when utcDate is an invalid date string', () => {
    expect(hasMatchStartedInBrasilia('invalid-date')).toBe(true);
  });

  it('returns false when match is in the future', () => {
    const referenceDate = new Date('2023-01-01T12:00:00Z');
    const matchDate = '2023-01-01T15:00:00Z';
    expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(false);
  });

  it('returns true when match has already started (past)', () => {
    const referenceDate = new Date('2023-01-01T15:00:00Z');
    const matchDate = '2023-01-01T12:00:00Z';
    expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(true);
  });

  it('returns true when match starts exactly at the reference time', () => {
    const referenceDate = new Date('2023-01-01T12:00:00Z');
    const matchDate = '2023-01-01T12:00:00Z';
    expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(true);
  });
});
