import { useMemo, useState } from 'react'
import { Match, Round } from '../types'
import { isAfterCutoff } from '../utils/date'
import { submitPredictions } from '../services/api'
import Alert from '../components/Alert'
import MatchCard from '../components/MatchCard'

const initialScore = { home: 0, away: 0 }

type HomePageProps = {
  round: Round | null
  matches: Match[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export default function HomePage({
  round,
  matches,
  loading,
  error,
  onRefresh,
}: HomePageProps) {
  const [name, setName] = useState('')
  const [submissionToken, setSubmissionToken] = useState('')
  const [scores, setScores] = useState<
    Record<number, { home: number; away: number }>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const cutoffReached = useMemo(
    () => isAfterCutoff(round?.cutoffAt),
    [round?.cutoffAt],
  )

  const canSubmit =
    name.trim().length > 1 &&
    submissionToken.trim().length > 0 &&
    matches.length > 0 &&
    !cutoffReached &&
    !submitting

  const handleScoreChange = (matchId: number, home: number, away: number) => {
    setScores((current) => ({
      ...current,
      [matchId]: {
        home,
        away,
      },
    }))
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    setSuccess(null)

    if (!round) {
      setSubmitError('Rodada ainda não carregada.')
      return
    }

    if (name.trim().length < 2) {
      setSubmitError('Informe seu nome.')
      return
    }

    if (submissionToken.trim().length === 0) {
      setSubmitError('Informe o token de envio.')
      return
    }

    const predictions = matches.map((match) => {
      const value = scores[match.id] ?? initialScore
      return {
        matchId: match.id,
        home: value.home,
        away: value.away,
      }
    })

    setSubmitting(true)
    try {
      await submitPredictions({
        roundId: round.id,
        participantName: name.trim(),
        submissionToken: submissionToken.trim(),
        predictions,
      })
      setSuccess('Palpites enviados com sucesso!')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Erro ao enviar palpites',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p>Carregando jogos...</p>
  }

  if (error) {
    return (
      <div>
        <Alert type="error" message={error} />
        <button
          onClick={onRefresh}
          style={{ padding: '12px 16px', borderRadius: '8px' }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!round) {
    return <Alert type="info" message="Nenhuma rodada disponível no momento." />
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div
        style={{
          background: '#e0f2fe',
          padding: '12px 16px',
          borderRadius: '12px',
        }}
      >
        <strong>Rodada {round.roundNumber}</strong> • Envio até{' '}
        {new Date(round.cutoffAt).toLocaleString('pt-BR')}
      </div>

      {cutoffReached && (
        <Alert type="error" message="Palpites encerrados (após terça 17h)." />
      )}

      <label style={{ display: 'grid', gap: '8px' }}>
        Nome
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
          disabled={cutoffReached}
        />
      </label>

      <label style={{ display: 'grid', gap: '8px' }}>
        Qual é a cor do cavalo branco de napoleão?
        <input
          value={submissionToken}
          onChange={(event) => setSubmissionToken(event.target.value)}
          placeholder="Resposta"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
          disabled={cutoffReached}
        />
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
          gap: '16px',
        }}
      >
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            value={scores[match.id] ?? initialScore}
            onChange={handleScoreChange}
            disabled={cutoffReached}
          />
        ))}
      </div>

      {submitError && <Alert type="error" message={submitError} />}
      {success && <Alert type="success" message={success} />}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          padding: '14px',
          borderRadius: '12px',
          background: canSubmit ? '#2563eb' : '#94a3b8',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {submitting ? 'Enviando...' : 'Enviar palpites'}
      </button>
    </div>
  )
}
