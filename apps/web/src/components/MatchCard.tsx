import { Match } from '../types'
import { formatDate } from '../utils/date'

type MatchCardProps = {
  match: Match
  value: { home: number; away: number }
  onChange: (matchId: number, home: number, away: number) => void
  disabled?: boolean
}

export default function MatchCard({
  match,
  value,
  onChange,
  disabled,
}: MatchCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 6px 16px var(--color-shadow)',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div>
        <strong>{match.homeTeam}</strong> x <strong>{match.awayTeam}</strong>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {formatDate(match.utcDate)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="number"
          min={0}
          value={Number.isNaN(value.home) ? '' : value.home}
          disabled={disabled}
          onChange={(event) =>
            onChange(match.id, Number(event.target.value), value.away)
          }
          onFocus={(event) => event.target.select()}
          style={{
            width: '64px',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
        <span style={{ fontWeight: 600 }}>x</span>
        <input
          type="number"
          min={0}
          value={Number.isNaN(value.away) ? '' : value.away}
          disabled={disabled}
          onChange={(event) =>
            onChange(match.id, value.home, Number(event.target.value))
          }
          onFocus={(event) => event.target.select()}
          style={{
            width: '64px',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {disabled && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
          Palpite bloqueado (jogo já começou)
        </div>
      )}
    </div>
  )
}
