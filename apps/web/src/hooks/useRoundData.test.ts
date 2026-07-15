import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRoundData } from './useRoundData';
import * as api from '../services/api';
import { Match, Round } from '../types';

vi.mock('../services/api');

describe('useRoundData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('initially sets loading to true', async () => {
    // Create a promise that won't resolve immediately to check initial state
    let resolvePromise: any;
    const promise = new Promise<{ round: Round; matches: Match[] }>(resolve => {
      resolvePromise = resolve;
    });
    vi.mocked(api.fetchNextRound).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useRoundData());

    // Initial state before promise resolves
    expect(result.current.loading).toBe(true);
    expect(result.current.round).toBe(null);
    expect(result.current.matches).toEqual([]);
    expect(result.current.error).toBe(null);

    // Resolve promise to clean up
    resolvePromise({ round: { id: 1, number: 1, isCurrent: true }, matches: [] });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('successfully fetches and sets round data', async () => {
    const mockRound: Round = { id: 1, number: 10, isCurrent: true };
    const mockMatches: Match[] = [
      { id: 100, homeTeam: 'Team A', awayTeam: 'Team B', status: 'SCHEDULED', matchDate: '2024-05-15T20:00:00Z', homeScore: null, awayScore: null }
    ];

    vi.mocked(api.fetchNextRound).mockResolvedValueOnce({
      round: mockRound,
      matches: mockMatches,
    });

    const { result } = renderHook(() => useRoundData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.round).toEqual(mockRound);
    expect(result.current.matches).toEqual(mockMatches);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error correctly', async () => {
    vi.mocked(api.fetchNextRound).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRoundData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.round).toBe(null);
    expect(result.current.matches).toEqual([]);
  });

  it('handles non-Error objects in catch correctly', async () => {
    vi.mocked(api.fetchNextRound).mockRejectedValueOnce('Some string error');

    const { result } = renderHook(() => useRoundData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao carregar rodada');
  });

  it('can refresh data correctly', async () => {
    const initialRound: Round = { id: 1, number: 1, isCurrent: true };
    const initialMatches: Match[] = [];

    vi.mocked(api.fetchNextRound).mockResolvedValueOnce({
      round: initialRound,
      matches: initialMatches,
    });

    const { result } = renderHook(() => useRoundData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.round).toEqual(initialRound);

    // Setup for refresh
    const refreshedRound: Round = { id: 2, number: 2, isCurrent: true };
    let resolveRefresh: any;
    const refreshPromise = new Promise<{ round: Round; matches: Match[] }>(resolve => {
      resolveRefresh = resolve;
    });
    vi.mocked(api.fetchNextRound).mockReturnValueOnce(refreshPromise);

    // Call refresh
    act(() => {
      result.current.refresh();
    });

    // Verify loading state during refresh
    expect(result.current.loading).toBe(true);

    // Resolve refresh promise
    resolveRefresh({
      round: refreshedRound,
      matches: [],
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.round).toEqual(refreshedRound);
  });
});
