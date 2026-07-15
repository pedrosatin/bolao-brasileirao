import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import {
  fetchNextRound,
  fetchRankings,
  fetchGlobalRanking,
  fetchHistory,
  fetchRoundPredictions,
  submitPredictions,
  adminGenerateSubmissionToken,
  adminDeletePredictionsByName,
  adminRecalculateRound,
  adminSyncFinishedMatches
} from './api';

describe('API Services', () => {
  let fetchMock: MockInstance;
  const mockBaseUrl = 'http://test-api.com';

  beforeEach(() => {
    // Reset vi mocks
    vi.clearAllMocks();

    // Setup fetch mock
    fetchMock = vi.spyOn(globalThis, 'fetch');

    // Setup environment
    vi.stubEnv('VITE_API_BASE_URL', mockBaseUrl);

    // Create a successful default mock response
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchMock.mockRestore();
  });

  describe('Public API methods', () => {
    it('fetchNextRound should call /rounds/next', async () => {
      const mockData = { round: {}, matches: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchNextRound();
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rounds/next`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('fetchRankings should call /rankings/round/:id', async () => {
      const mockData = { roundId: 1, ranking: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchRankings(1);
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rankings/round/1`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('fetchGlobalRanking should call /rankings/global', async () => {
      const mockData = { ranking: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchGlobalRanking();
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rankings/global`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('fetchHistory should call /rounds/history', async () => {
      const mockData = { rounds: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchHistory();
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rounds/history`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('fetchHistory with includeActive should call /rounds/history?includeActive=true', async () => {
      const mockData = { rounds: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchHistory(true);
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rounds/history?includeActive=true`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('fetchRoundPredictions should call /rounds/:id/predictions', async () => {
      const mockData = { roundId: 1, predictions: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await fetchRoundPredictions(1);
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rounds/1/predictions`, expect.any(Object));
      expect(result).toEqual(mockData);
    });
  });

  describe('Submit predictions', () => {
    it('submitPredictions should post to /predictions', async () => {
      const payload = {
        roundId: 1,
        participantName: 'Test',
        submissionToken: 'token',
        predictions: []
      };
      const mockData = { message: 'Success' };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await submitPredictions(payload);

      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/predictions`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      expect(result).toEqual(mockData);
    });
  });

  describe('Admin endpoints', () => {
    const adminToken = 'secret-token';

    it('adminGenerateSubmissionToken should post to admin generate token endpoint', async () => {
      const mockData = { roundId: 1, submissionToken: 'token', expiresAt: '2024' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await adminGenerateSubmissionToken(1, adminToken);

      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/admin/rounds/1/submission-token`, expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Admin-Token': adminToken
        })
      }));
      expect(result).toEqual(mockData);
    });

    it('adminDeletePredictionsByName should delete participant predictions', async () => {
      const mockData = { roundId: 1, participantName: 'Test Name', deletedPredictions: 1, deletedScoreRows: 1 };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await adminDeletePredictionsByName(1, 'Test Name', adminToken);

      // Should URI encode the participant name
      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/admin/rounds/1/predictions/Test%20Name`, expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'X-Admin-Token': adminToken
        })
      }));
      expect(result).toEqual(mockData);
    });

    it('adminRecalculateRound should post to recalculate endpoint', async () => {
      const mockData = { roundId: 1, message: 'Recalculated' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await adminRecalculateRound(1, adminToken);

      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/rounds/1/recalculate`, expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Admin-Token': adminToken
        })
      }));
      expect(result).toEqual(mockData);
    });

    it('adminSyncFinishedMatches should post to sync-finished endpoint', async () => {
      const mockData = { message: 'Synced' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      const result = await adminSyncFinishedMatches(adminToken);

      expect(fetchMock).toHaveBeenCalledWith(`${mockBaseUrl}/admin/sync-finished`, expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Admin-Token': adminToken
        })
      }));
      expect(result).toEqual(mockData);
    });
  });

  describe('Error handling', () => {
    it('should throw parsed error message on failed request with JSON error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid round ID' })
      } as Response);

      await expect(fetchNextRound()).rejects.toThrow('Invalid round ID');
    });

    it('should throw generic error message on failed request with malformed JSON', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Malformed JSON'); }
      } as unknown as Response);

      await expect(fetchNextRound()).rejects.toThrow('Request failed');
    });
  });

  describe('Base URL resolution fallback', () => {
    it('should fallback to localhost if DEV is true and no VITE_API_BASE_URL is provided', async () => {
      vi.stubEnv('VITE_API_BASE_URL', '');
      vi.stubEnv('DEV', true as any);

      const mockData = { round: {}, matches: [] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      await fetchNextRound();
      // Wait for test to verify it hits local fallback - Note: we can't easily mock `import.meta.env.DEV` statically with vi.stubEnv
      // Let's assert based on how we setup Vite in dev or mock.
      // But we can check that it hits localhost:8787 if import.meta.env.VITE_API_BASE_URL is not set.
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8787/rounds/next', expect.any(Object));
    });
  });
});
