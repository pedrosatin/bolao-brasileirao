import { describe, it, expect, vi } from 'vitest';
import { getLatestRound, RoundRow } from './db';

describe('db', () => {
  describe('getLatestRound', () => {
    it('returns the latest round when one exists', async () => {
      const mockRow: RoundRow = {
        id: 1,
        season: 2024,
        round_number: 10,
        cutoff_at: '2024-05-14T20:00:00.000Z',
        last_sync_at: '2024-05-13T20:00:00.000Z',
      };

      const mockFirst = vi.fn().mockResolvedValue(mockRow);
      const mockPrepare = vi.fn().mockReturnValue({
        first: mockFirst,
      });

      const mockDb = {
        prepare: mockPrepare,
      } as any; // Cast as any because D1Database has a lot of fields

      const result = await getLatestRound(mockDb);

      expect(mockPrepare).toHaveBeenCalledWith(
        "SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds ORDER BY season DESC, round_number DESC LIMIT 1"
      );
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual(mockRow);
    });

    it('returns null when no rounds exist', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockPrepare = vi.fn().mockReturnValue({
        first: mockFirst,
      });

      const mockDb = {
        prepare: mockPrepare,
      } as any;

      const result = await getLatestRound(mockDb);

      expect(mockPrepare).toHaveBeenCalledWith(
        "SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds ORDER BY season DESC, round_number DESC LIMIT 1"
      );
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
