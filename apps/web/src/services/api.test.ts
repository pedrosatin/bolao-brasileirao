import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchRankings } from './api';

describe('api services - fetchRankings', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
    // Mock the global fetch function
    global.fetch = vi.fn();
    // Also mock process.env or import.meta.env if needed by api.ts
    // The current api.ts defaults to http://localhost:8787 if no env is set in DEV
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('correctly calls the endpoint and returns JSON data on success', async () => {
    const mockData = { roundId: 1, ranking: [{ participantName: 'Alice', points: 10, exactScores: 1, correctOutcomes: 1 }] };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchRankings(1);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8787/rankings/round/1', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    expect(result).toEqual(mockData);
  });

  it('throws an error with the server-provided message when response is not ok and JSON has error field', async () => {
    const mockErrorData = { error: 'Round not found' };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorData
    });

    await expect(fetchRankings(999)).rejects.toThrow('Round not found');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws a generic fallback error when response is not ok and JSON parsing fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error('Invalid JSON'); }
    });

    await expect(fetchRankings(999)).rejects.toThrow('Request failed');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
