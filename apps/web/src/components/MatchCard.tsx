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
        background: '#ffffff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <strong>{match.homeTeam}</strong> x <strong>{match.awayTeam}</strong>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {formatDate(match.utcDate)}
          </div>
        </div>
        {match.externalLink && (
          <a href={match.externalLink} target="_blank" rel="noreferrer">
            Escalação
          </a>
        )}
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
          style={{
            width: '64px',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
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
          style={{
            width: '64px',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
        />
      </div>
    </div>
  )
}
