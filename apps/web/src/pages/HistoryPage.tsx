import { useEffect, useState } from 'react'
import {
  fetchHistory,
  fetchRankings,
  fetchRoundPredictions,
} from '../services/api'
import { RankingEntry, RoundHistory, RoundPrediction } from '../types'
import Alert from '../components/Alert'
import { formatDate } from '../utils/date'

export default function HistoryPage() {
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

  if (loading) {
    return <p>Carregando histórico...</p>
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <h2>Rodadas anteriores</h2>
      {history.length === 0 ? (
        <p>Nenhuma rodada finalizada.</p>
      ) : (
        <select
          value={selectedRound?.id ?? ''}
          onChange={(event) => {
            const round = history.find(
              (item) => item.id === Number(event.target.value),
            )
            if (round) {
              setSelectedRound(round)
            }
          }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
        >
          {history.map((round) => (
            <option key={round.id} value={round.id}>
              Rodada {round.round_number} — {formatDate(round.cutoff_at)}
            </option>
          ))}
        </select>
      )}

      {selectedRound && (
        <div>
          <h3>Ranking da rodada {selectedRound.round_number}</h3>
          {ranking.length === 0 ? (
            <p>Sem pontuações calculadas.</p>
          ) : (
            <ol>
              {ranking.map((entry) => (
                <li key={entry.name}>
                  {entry.name} — {entry.points} pts
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {selectedRound && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h3>Palpites da rodada</h3>
          {predictions.length === 0 ? (
            <p>Nenhum palpite encontrado.</p>
          ) : (
            Object.entries(
              predictions.reduce<Record<string, RoundPrediction[]>>(
                (acc, item) => {
                  if (!acc[item.participantName]) {
                    acc[item.participantName] = []
                  }
                  acc[item.participantName].push(item)
                  return acc
                },
                {},
              ),
            ).map(([participant, items]) => (
              <div
                key={participant}
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                }}
              >
                <strong>{participant}</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  {items.map((item) => (
                    <li key={`${participant}-${item.matchId}`}>
                      {item.homeTeam} {item.predHome} x {item.predAway}{' '}
                      {item.awayTeam}
                      {item.homeScore !== null && item.awayScore !== null && (
                        <>
                          {' '}
                          — Resultado: {item.homeScore} x {item.awayScore}
                        </>
                      )}
                      {typeof item.points === 'number' && (
                        <span> — {item.points} pts</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
