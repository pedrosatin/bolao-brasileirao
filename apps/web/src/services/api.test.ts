import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNextRound } from './api';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchNextRound', () => {
    it('makes a request to /rounds/next and returns data on success', async () => {
      const mockData = { round: { id: 1 }, matches: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchNextRound();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = fetchMock.mock.calls[0][0];
      expect(typeof url).toBe('string');
      expect(url).toMatch(/\/rounds\/next$/);

      expect(result).toEqual(mockData);
    });

    it('throws an error with message from response when request fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(fetchNextRound()).rejects.toThrow('Server error');
    });

    it('throws a default error when request fails and response cannot be parsed', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Parse error'); },
      });

      await expect(fetchNextRound()).rejects.toThrow('Request failed');
    });
  });
});
