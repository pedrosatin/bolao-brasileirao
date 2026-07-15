import { describe, it, expect, vi } from 'vitest';
import { getRoundBySeasonNumber, RoundRow } from './db';

describe('db', () => {
  describe('getRoundBySeasonNumber', () => {
    it('should return the round when found', async () => {
      const mockRound: RoundRow = {
        id: 1,
        season: 2024,
        round_number: 10,
        cutoff_at: '2024-01-01T00:00:00Z',
        last_sync_at: null,
      };

      const mockFirst = vi.fn().mockResolvedValue(mockRound);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

      const mockDb = { prepare: mockPrepare } as any;

      const result = await getRoundBySeasonNumber(mockDb, 2024, 10);

      expect(mockPrepare).toHaveBeenCalledWith(
        "SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds WHERE season = ? AND round_number = ?"
      );
      expect(mockBind).toHaveBeenCalledWith(2024, 10);
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toEqual(mockRound);
    });

    it('should return null when round is not found', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

      const mockDb = { prepare: mockPrepare } as any;

      const result = await getRoundBySeasonNumber(mockDb, 2024, 99);

      expect(mockPrepare).toHaveBeenCalledWith(
        "SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds WHERE season = ? AND round_number = ?"
      );
      expect(mockBind).toHaveBeenCalledWith(2024, 99);
      expect(mockFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle undefined result from first() by returning null', async () => {
      // The Cloudflare D1 first() method can return undefined if no row is found,
      // but in some type definitions it might return null.
      // The code uses `?? null` to cover both cases.
      const mockFirst = vi.fn().mockResolvedValue(undefined);
      const mockBind = vi.fn().mockReturnValue({ first: mockFirst });
      const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

      const mockDb = { prepare: mockPrepare } as any;

      const result = await getRoundBySeasonNumber(mockDb, 2024, 99);

      expect(result).toBeNull();
    });
  });
});
