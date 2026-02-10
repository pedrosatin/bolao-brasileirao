import { useEffect, useState } from 'react'
import { fetchGlobalRanking, fetchRankings } from '../services/api'
import { RankingEntry, Round } from '../types'
import Alert from '../components/Alert'

type RankingsPageProps = {
  round: Round | null
}

export default function RankingsPage({ round }: RankingsPageProps) {
  const [roundRanking, setRoundRanking] = useState<RankingEntry[]>([])
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (round) {
          const roundResponse = await fetchRankings(round.id)
          setRoundRanking(roundResponse.ranking)
        }
        const globalResponse = await fetchGlobalRanking()
        setGlobalRanking(globalResponse.ranking)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar ranking',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [round])

  if (loading) {
    return <p>Carregando rankings...</p>
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section>
        <h2>Ranking da Rodada</h2>
        {roundRanking.length === 0 ? (
          <p>Sem palpites computados.</p>
        ) : (
          <ol>
            {roundRanking.map((entry) => (
              <li key={entry.name}>
                {entry.name} — {entry.points} pts
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2>Ranking Geral</h2>
        {globalRanking.length === 0 ? (
          <p>Sem palpites computados.</p>
        ) : (
          <ol>
            {globalRanking.map((entry) => (
              <li key={entry.name}>
                {entry.name} — {entry.points} pts
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
