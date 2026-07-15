import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useHistoryData } from './useHistoryData'
import { fetchHistory, fetchRankings, fetchRoundPredictions } from '../services/api'
import { RoundHistory, RoundPrediction } from '../types'

vi.mock('../services/api', () => ({
  fetchHistory: vi.fn(),
  fetchRankings: vi.fn(),
  fetchRoundPredictions: vi.fn()
}))

const mockFetchHistory = vi.mocked(fetchHistory)
const mockFetchRankings = vi.mocked(fetchRankings)
const mockFetchRoundPredictions = vi.mocked(fetchRoundPredictions)

const mockRounds: RoundHistory[] = [
  { id: 1, season: 2024, round_number: 1, cutoff_at: '2024-01-01T00:00:00Z' },
  { id: 2, season: 2024, round_number: 2, cutoff_at: '2024-01-08T00:00:00Z' }
]

const mockRanking = [
  { name: 'Alice', points: 10 },
  { name: 'Bob', points: 8 }
]

const mockPredictions: RoundPrediction[] = [
  {
    participantName: 'Bob',
    predHome: 1,
    predAway: 1,
    points: 0,
    matchId: 101,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    homeScore: 2,
    awayScore: 1,
    utcDate: '2024-01-01T12:00:00Z'
  },
  {
    participantName: 'Alice',
    predHome: 2,
    predAway: 1,
    points: 10,
    matchId: 101,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    homeScore: 2,
    awayScore: 1,
    utcDate: '2024-01-01T12:00:00Z'
  },
  {
    participantName: 'Bob',
    predHome: 0,
    predAway: 0,
    points: 5,
    matchId: 102,
    homeTeam: 'Team C',
    awayTeam: 'Team D',
    homeScore: 0,
    awayScore: 0,
    utcDate: '2024-01-01T14:00:00Z'
  }
]

describe('useHistoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully load history on mount and select the first round', async () => {
    mockFetchHistory.mockResolvedValueOnce({ rounds: mockRounds })
    mockFetchRankings.mockResolvedValueOnce({ roundId: 1, ranking: mockRanking })
    mockFetchRoundPredictions.mockResolvedValueOnce({ roundId: 1, predictions: mockPredictions })

    const { result } = renderHook(() => useHistoryData())

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetchHistory).toHaveBeenCalledWith(true)
    expect(result.current.history).toEqual(mockRounds)
    expect(result.current.selectedRound).toEqual(mockRounds[0])

    await waitFor(() => {
      expect(mockFetchRankings).toHaveBeenCalledWith(mockRounds[0].id)
      expect(mockFetchRoundPredictions).toHaveBeenCalledWith(mockRounds[0].id)
    })

    expect(result.current.ranking).toEqual(mockRanking)
    expect(result.current.error).toBeNull()
  })

  it('should automatically fetch rankings and predictions when selecting a different round', async () => {
    mockFetchHistory.mockResolvedValueOnce({ rounds: mockRounds })
    mockFetchRankings.mockResolvedValueOnce({ roundId: 1, ranking: [] })
    mockFetchRoundPredictions.mockResolvedValueOnce({ roundId: 1, predictions: [] })

    const { result } = renderHook(() => useHistoryData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear initial calls for round 1
    mockFetchRankings.mockClear()
    mockFetchRoundPredictions.mockClear()

    const newRanking = [{ name: 'Charlie', points: 15 }]
    mockFetchRankings.mockResolvedValueOnce({ roundId: 2, ranking: newRanking })
    mockFetchRoundPredictions.mockResolvedValueOnce({ roundId: 2, predictions: [] })

    act(() => {
      result.current.setSelectedRound(mockRounds[1])
    })

    await waitFor(() => {
      expect(mockFetchRankings).toHaveBeenCalledWith(mockRounds[1].id)
      expect(mockFetchRoundPredictions).toHaveBeenCalledWith(mockRounds[1].id)
    })

    expect(result.current.ranking).toEqual(newRanking)
    expect(result.current.selectedRound).toEqual(mockRounds[1])
  })

  it('should handle error when fetchHistory fails', async () => {
    mockFetchHistory.mockRejectedValueOnce(new Error('Network error fetching history'))

    const { result } = renderHook(() => useHistoryData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error fetching history')
    expect(result.current.history).toEqual([])
  })

  it('should handle error when fetching rankings or predictions fails', async () => {
    mockFetchHistory.mockResolvedValueOnce({ rounds: mockRounds })
    mockFetchRankings.mockRejectedValueOnce(new Error('Network error fetching rankings'))

    const { result } = renderHook(() => useHistoryData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Network error fetching rankings')
    })
  })

  it('should compute and sort groupedPredictions correctly', async () => {
    mockFetchHistory.mockResolvedValueOnce({ rounds: mockRounds })
    mockFetchRankings.mockResolvedValueOnce({ roundId: 1, ranking: mockRanking })
    mockFetchRoundPredictions.mockResolvedValueOnce({ roundId: 1, predictions: mockPredictions })

    const { result } = renderHook(() => useHistoryData())

    await waitFor(() => {
      expect(result.current.groupedPredictions.length).toBeGreaterThan(0)
    })

    const grouped = result.current.groupedPredictions
    expect(grouped).toHaveLength(2)

    // Should be sorted alphabetically by participantName
    expect(grouped[0].participant).toBe('Alice')
    expect(grouped[0].items).toHaveLength(1)
    expect(grouped[0].items[0].matchId).toBe(101)

    expect(grouped[1].participant).toBe('Bob')
    expect(grouped[1].items).toHaveLength(2)
    // Check if the items correspond to Bob's predictions
    const bobMatchIds = grouped[1].items.map(i => i.matchId)
    expect(bobMatchIds).toContain(101)
    expect(bobMatchIds).toContain(102)
  })
})
