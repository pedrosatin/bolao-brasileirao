import { describe, it, expect } from 'vitest';
import { getNextTuesdayCutoffUtcIso, hasMatchStartedInBrasilia } from './time';

describe('time utilities', () => {
  describe('getNextTuesdayCutoffUtcIso', () => {
    // BRT is UTC-3, so 17:00 BRT is 20:00 UTC.

    it('returns the next Tuesday 17:00 BRT when current time is earlier in the week', () => {
      // Monday 2024-05-13 12:00 BRT (15:00 UTC)
      const nowUtc = new Date('2024-05-13T15:00:00.000Z');
      const expectedCutoff = '2024-05-14T20:00:00.000Z'; // Tuesday 2024-05-14 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });

    it('returns the same day Tuesday 17:00 BRT when current time is Tuesday before 17:00 BRT', () => {
      // Tuesday 2024-05-14 16:59 BRT (19:59 UTC)
      const nowUtc = new Date('2024-05-14T19:59:00.000Z');
      const expectedCutoff = '2024-05-14T20:00:00.000Z'; // Same Tuesday 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });

    it('returns the same day Tuesday 17:00 BRT when current time is exactly Tuesday 17:00 BRT', () => {
      // Tuesday 2024-05-14 17:00 BRT (20:00 UTC)
      const nowUtc = new Date('2024-05-14T20:00:00.000Z');
      const expectedCutoff = '2024-05-14T20:00:00.000Z'; // Same Tuesday 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });

    it('returns the NEXT Tuesday 17:00 BRT when current time is Tuesday after 17:00 BRT', () => {
      // Tuesday 2024-05-14 17:01 BRT (20:01 UTC)
      const nowUtc = new Date('2024-05-14T20:01:00.000Z');
      const expectedCutoff = '2024-05-21T20:00:00.000Z'; // Next Tuesday 2024-05-21 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });

    it('returns the NEXT Tuesday 17:00 BRT when current time is later in the week (e.g. Wednesday)', () => {
      // Wednesday 2024-05-15 10:00 BRT (13:00 UTC)
      const nowUtc = new Date('2024-05-15T13:00:00.000Z');
      const expectedCutoff = '2024-05-21T20:00:00.000Z'; // Next Tuesday 2024-05-21 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });

    it('returns the NEXT Tuesday 17:00 BRT when current time is Sunday', () => {
      // Sunday 2024-05-19 10:00 BRT (13:00 UTC)
      const nowUtc = new Date('2024-05-19T13:00:00.000Z');
      const expectedCutoff = '2024-05-21T20:00:00.000Z'; // Next Tuesday 2024-05-21 17:00 BRT -> 20:00 UTC
      expect(getNextTuesdayCutoffUtcIso(nowUtc)).toBe(expectedCutoff);
    });
  });

  describe('hasMatchStartedInBrasilia', () => {
    it('returns true if utcDate is empty', () => {
      expect(hasMatchStartedInBrasilia('', new Date())).toBe(true);
    });

    it('returns true if utcDate is invalid', () => {
      expect(hasMatchStartedInBrasilia('invalid-date', new Date())).toBe(true);
    });

    it('returns true if referenceDate is after matchDate', () => {
      const matchDate = '2024-05-14T15:00:00.000Z';
      const referenceDate = new Date('2024-05-14T15:01:00.000Z');
      expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(true);
    });

    it('returns false if referenceDate is before matchDate', () => {
      const matchDate = '2024-05-14T15:00:00.000Z';
      const referenceDate = new Date('2024-05-14T14:59:00.000Z');
      expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(false);
    });

    it('returns true if referenceDate is exactly matchDate', () => {
      const matchDate = '2024-05-14T15:00:00.000Z';
      const referenceDate = new Date('2024-05-14T15:00:00.000Z');
      expect(hasMatchStartedInBrasilia(matchDate, referenceDate)).toBe(true);
    });
  });
});
