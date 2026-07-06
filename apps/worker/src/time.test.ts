import { describe, it, expect } from 'vitest';
import { getNextTuesdayCutoffUtcIso } from './time';

describe('getNextTuesdayCutoffUtcIso', () => {
  it('should return the following Tuesday at 20:00 UTC for a date on Monday', () => {
    // Monday, October 9, 2023, 12:00:00 UTC
    const monday = new Date('2023-10-09T12:00:00.000Z');
    // Expected: Tuesday, October 10, 2023, 20:00:00 UTC (17:00 BRT)
    const expected = '2023-10-10T20:00:00.000Z';
    expect(getNextTuesdayCutoffUtcIso(monday)).toBe(expected);
  });

  it('should return the same day at 20:00 UTC for a date on Tuesday before 17:00 BRT', () => {
    // Tuesday, October 10, 2023, 12:00:00 UTC (09:00 BRT)
    const tuesdayMorning = new Date('2023-10-10T12:00:00.000Z');
    // Expected: Tuesday, October 10, 2023, 20:00:00 UTC (17:00 BRT)
    const expected = '2023-10-10T20:00:00.000Z';
    expect(getNextTuesdayCutoffUtcIso(tuesdayMorning)).toBe(expected);
  });

  it('should return the same day at 20:00 UTC for a date on Tuesday exactly at 17:00 BRT', () => {
    // Tuesday, October 10, 2023, 20:00:00 UTC (17:00 BRT)
    const tuesdayCutoff = new Date('2023-10-10T20:00:00.000Z');
    // Expected: Tuesday, October 10, 2023, 20:00:00 UTC (17:00 BRT)
    const expected = '2023-10-10T20:00:00.000Z';
    expect(getNextTuesdayCutoffUtcIso(tuesdayCutoff)).toBe(expected);
  });

  it('should return the following Tuesday at 20:00 UTC for a date on Tuesday after 17:00 BRT', () => {
    // Tuesday, October 10, 2023, 20:01:00 UTC (17:01 BRT)
    const tuesdayAfterCutoff = new Date('2023-10-10T20:01:00.000Z');
    // Expected: Tuesday, October 17, 2023, 20:00:00 UTC (17:00 BRT)
    const expected = '2023-10-17T20:00:00.000Z';
    expect(getNextTuesdayCutoffUtcIso(tuesdayAfterCutoff)).toBe(expected);
  });

  it('should return the following Tuesday at 20:00 UTC for a date on Wednesday', () => {
    // Wednesday, October 11, 2023, 12:00:00 UTC
    const wednesday = new Date('2023-10-11T12:00:00.000Z');
    // Expected: Tuesday, October 17, 2023, 20:00:00 UTC (17:00 BRT)
    const expected = '2023-10-17T20:00:00.000Z';
    expect(getNextTuesdayCutoffUtcIso(wednesday)).toBe(expected);
  });
});
