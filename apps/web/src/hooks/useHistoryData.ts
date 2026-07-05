import { useEffect, useMemo, useState } from 'react'
import { fetchHistory, fetchRankings, fetchRoundPredictions } from '../services/api'
import { RankingEntry, RoundHistory, RoundPrediction } from '../types'

export function useHistoryData() {
  const [history, setHistory] = useState<RoundHistory[]>([])
  const [selectedRound, setSelectedRound] = useState<RoundHistory | null>(null)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [predictions, setPredictions] = useState<RoundPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchHistory(true)
        setHistory(response.rounds)
        if (response.rounds.length > 0) {
          setSelectedRound(response.rounds[0])
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar histórico',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    const loadRanking = async () => {
      if (!selectedRound) {
        return
      }
      try {
        const response = await fetchRankings(selectedRound.id)
        setRanking(response.ranking)
        const predictionsResponse = await fetchRoundPredictions(
          selectedRound.id,
        )
        setPredictions(predictionsResponse.predictions)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar ranking da rodada',
        )
      }
    }

    loadRanking()
  }, [selectedRound])

  const groupedPredictions = useMemo(() => {
    const groups = predictions.reduce<Record<string, RoundPrediction[]>>(
      (acc, item) => {
        if (!acc[item.participantName]) {
          acc[item.participantName] = []
        }
        acc[item.participantName].push(item)
        return acc
      },
      {},
    )

    return Object.entries(groups)
      .map(([participant, items]) => ({ participant, items }))
      .sort((a, b) => a.participant.localeCompare(b.participant))
  }, [predictions])

  return {
    history,
    selectedRound,
    setSelectedRound,
    ranking,
    groupedPredictions,
    loading,
    error,
  }
}
