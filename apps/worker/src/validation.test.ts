import { describe, it, expect } from 'vitest';
import { parsePredictionsPayload } from './validation';

describe('parsePredictionsPayload', () => {
  it('should return parsed payload for valid data', () => {
    const validData = {
      participantName: 'John Doe',
      roundId: 10,
      submissionToken: 'token123',
      predictions: [
        { matchId: 1, home: 2, away: 1 },
        { matchId: 2, home: 0, away: 0 }
      ]
    };

    const result = parsePredictionsPayload(validData);

    expect(result).toEqual({
      participantName: 'John Doe',
      roundId: 10,
      submissionToken: 'token123',
      predictions: [
        { matchId: 1, home: 2, away: 1 },
        { matchId: 2, home: 0, away: 0 }
      ]
    });
  });
  it('should return null if body is missing or not an object', () => {
    expect(parsePredictionsPayload(null)).toBeNull();
    expect(parsePredictionsPayload(undefined)).toBeNull();
    expect(parsePredictionsPayload('string')).toBeNull();
    expect(parsePredictionsPayload(123)).toBeNull();
  });

  describe('participantName validation', () => {
    const getBasePayload = () => ({
      roundId: 10,
      predictions: [{ matchId: 1, home: 1, away: 1 }]
    });

    it('should return null if participantName is missing', () => {
      expect(parsePredictionsPayload({ ...getBasePayload() })).toBeNull();
    });

    it('should return null if participantName is not a string', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), participantName: 123 })).toBeNull();
    });

    it('should return null if participantName is too short', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), participantName: 'A' })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), participantName: '   ' })).toBeNull(); // Trimmed length < 2
    });

    it('should return null if participantName is too long', () => {
      const longName = 'A'.repeat(51);
      expect(parsePredictionsPayload({ ...getBasePayload(), participantName: longName })).toBeNull();
    });
  });

  describe('predictions validation', () => {
    const getBasePayload = () => ({
      participantName: 'John Doe',
      roundId: 10
    });

    it('should return null if predictions is missing', () => {
      expect(parsePredictionsPayload({ ...getBasePayload() })).toBeNull();
    });

    it('should return null if predictions is not an array', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: {} })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: 'string' })).toBeNull();
    });

    it('should return null if predictions array is empty', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [] })).toBeNull();
    });

    it('should return null if a prediction item is missing or not an object', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [null] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [123] })).toBeNull();
    });

    it('should return null if matchId is missing or not a number', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ home: 1, away: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: '1', home: 1, away: 1 }] })).toBeNull();
    });

    it('should return null if home score is missing or not a number', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, away: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: '1', away: 1 }] })).toBeNull();
    });

    it('should return null if away score is missing or not a number', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1, away: '1' }] })).toBeNull();
    });

    it('should return null if home or away score is out of bounds', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: -1, away: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1, away: -1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 100, away: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1, away: 100 }] })).toBeNull();
    });

    it('should return null if home or away score is not an integer', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1.5, away: 1 }] })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), predictions: [{ matchId: 1, home: 1, away: 1.5 }] })).toBeNull();
    });
  });

  describe('optional fields validation', () => {
    const getBasePayload = () => ({
      participantName: 'John Doe',
      predictions: [{ matchId: 1, home: 1, away: 1 }]
    });

    it('should return null if roundId is defined but not a number', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), roundId: '10' })).toBeNull();
      expect(parsePredictionsPayload({ ...getBasePayload(), roundId: { id: 10 } })).toBeNull();
    });

    it('should return null if submissionToken is defined but not a string', () => {
      expect(parsePredictionsPayload({ ...getBasePayload(), roundId: 10, submissionToken: 123 })).toBeNull();
    });
  });
});
