import { useEffect, useMemo, useState } from 'react'
import { Match, Round } from '../types'
import { hasMatchStarted } from '../utils/date'
import { submitPredictions } from '../services/api'
import Alert from '../components/Alert'
import MatchCard from '../components/MatchCard'

const initialScore = { home: 0, away: 0 }

const SCHEDULABLE_STATUSES = new Set(['SCHEDULED', 'TIMED'])

function isMatchLocked(match: Match, referenceDate: Date): boolean {
  const status = (match.status ?? '').toUpperCase()
  if (!status || !SCHEDULABLE_STATUSES.has(status)) {
    return true
  }

  return hasMatchStarted(match.utcDate, referenceDate)
}

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
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const intervalId = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(intervalId)
  }, [])

  const isDev = import.meta.env.DEV

  const matchLocks = useMemo(() => {
    const referenceDate = new Date(now)
    return matches.reduce<Record<number, boolean>>((acc, match) => {
      acc[match.id] = isMatchLocked(match, referenceDate)
      return acc
    }, {})
  }, [matches, now])

  const openMatches = useMemo(
    () => matches.filter((match) => !matchLocks[match.id]),
    [matches, matchLocks],
  )

  const lockedCount = matches.length - openMatches.length
  const lockedLabel = lockedCount === 1 ? 'jogo' : 'jogos'
  const lockedVerb = lockedCount === 1 ? 'começou' : 'começaram'
  const hasOpenMatches = openMatches.length > 0

  const canSubmit =
    name.trim().length > 1 &&
    (isDev || submissionToken.trim().length > 0) &&
    hasOpenMatches &&
    !submitting

  const handleScoreChange = (matchId: number, home: number, away: number) => {
    if (matchLocks[matchId]) {
      return
    }

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

    if (submissionToken.trim().length === 0 && !isDev) {
      setSubmitError('Informe o token de envio.')
      return
    }

    if (!hasOpenMatches) {
      setSubmitError('Todos os jogos desta rodada já começaram.')
      return
    }

    const predictions = openMatches.map((match) => {
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
      // Zera inputs após sucesso
      setName('')
      setSubmissionToken('')
      setScores({})
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
      {lockedCount > 0 && (
        <Alert
          type="info"
          message={`${lockedCount} ${lockedLabel} já ${lockedVerb}. Palpites válidos apenas para os demais.`}
        />
      )}

      {!hasOpenMatches && (
        <Alert
          type="info"
          message="Todos os jogos desta rodada já começaram. Volte na próxima rodada."
        />
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
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
          }}
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
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
          }}
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
            disabled={Boolean(matchLocks[match.id])}
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
          background: canSubmit ? 'var(--color-accent-blue)' : 'var(--color-text-light)',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {submitting ? 'Enviando...' : 'Enviar palpites'}
      </button>
    </div>
  )
}
