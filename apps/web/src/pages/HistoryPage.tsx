import { useEffect, useMemo, useState } from 'react'
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

  const formatScore = (home: number | null, away: number | null) => {
    if (home === null || away === null) {
      return '—'
    }
    return `${home} x ${away}`
  }

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
          {groupedPredictions.length === 0 ? (
            <p>Nenhum palpite encontrado.</p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
              }}
            >
              {groupedPredictions.map(({ participant, items }) => (
                <div
                  key={participant}
                  style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                    flex: '1 1 320px',
                    maxWidth: '600px',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong style={{ fontSize: '1rem' }}>{participant}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {items.length} {items.length === 1 ? 'jogo' : 'jogos'}
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                      <thead>
                        <tr
                          style={{
                            textAlign: 'left',
                            color: '#475569',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <th
                            style={{
                              paddingBottom: '8px',
                              borderBottom: '1px solid #e2e8f0',
                              width: '45%',
                            }}
                          >
                            Jogo
                          </th>
                          <th
                            style={{
                              paddingBottom: '8px',
                              borderBottom: '1px solid #e2e8f0',
                              width: '20%',
                            }}
                          >
                            Palpite
                          </th>
                          <th
                            style={{
                              paddingBottom: '8px',
                              borderBottom: '1px solid #e2e8f0',
                              width: '15%',
                            }}
                          >
                            Resultado
                          </th>
                          <th
                            style={{
                              paddingBottom: '8px',
                              borderBottom: '1px solid #e2e8f0',
                              width: '20%',
                              textAlign: 'right',
                            }}
                          >
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const borderStyle =
                            index === items.length - 1
                              ? 'none'
                              : '1px solid #f1f5f9'

                          return (
                            <tr key={`${participant}-${item.matchId}`}>
                              <td
                                style={{
                                  padding: '10px 0',
                                  borderBottom: borderStyle,
                                  fontWeight: 500,
                                }}
                              >
                                {item.homeTeam} x {item.awayTeam}
                              </td>
                              <td
                                style={{
                                  padding: '10px 0',
                                  borderBottom: borderStyle,
                                  color: '#0f172a',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {item.predHome} x {item.predAway}
                              </td>
                              <td
                                style={{
                                  padding: '10px 0',
                                  borderBottom: borderStyle,
                                  color: '#0f172a',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {formatScore(item.homeScore, item.awayScore)}
                              </td>
                              <td
                                style={{
                                  padding: '10px 0',
                                  borderBottom: borderStyle,
                                  textAlign: 'right',
                                  fontWeight: 600,
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {typeof item.points === 'number'
                                  ? item.points
                                  : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
