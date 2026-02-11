import { useMemo, useState } from 'react'
import Alert from '../components/Alert'
import {
  adminDeletePredictionsByName,
  adminGenerateSubmissionToken,
} from '../services/api'

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('')
  const [roundIdText, setRoundIdText] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const roundId = useMemo(() => Number(roundIdText), [roundIdText])
  const roundIdValid = !Number.isNaN(roundId) && roundId > 0

  const canRun = adminToken.trim().length > 0 && roundIdValid && !loading

  const handleGenerateToken = async () => {
    setError(null)
    setSuccess(null)
    setGeneratedToken(null)
    setExpiresAt(null)

    if (!canRun) {
      setError('Informe ADMIN token e o id da rodada.')
      return
    }

    setLoading(true)
    try {
      const result = await adminGenerateSubmissionToken(
        roundId,
        adminToken.trim(),
      )
      setGeneratedToken(result.submissionToken)
      setExpiresAt(result.expiresAt)
      setSuccess('Token gerado com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar token')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePredictions = async () => {
    setError(null)
    setSuccess(null)

    if (!canRun) {
      setError('Informe ADMIN token e o id da rodada.')
      return
    }

    if (participantName.trim().length < 2) {
      setError('Informe o nome do participante.')
      return
    }

    setLoading(true)
    try {
      const result = await adminDeletePredictionsByName(
        roundId,
        participantName.trim(),
        adminToken.trim(),
      )
      setSuccess(
        `Removido. predictions=${result.deletedPredictions}, scores=${result.deletedScoreRows}`,
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao deletar predictions',
      )
    } finally {
      setLoading(false)
    }
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
        <strong>Admin</strong> • endpoints protegidos por{' '}
        <code>X-Admin-Token</code>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <label style={{ display: 'grid', gap: '8px' }}>
        Admin token
        <input
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          placeholder="Cole o ADMIN token"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '8px' }}>
        Round ID
        <input
          value={roundIdText}
          onChange={(e) => setRoundIdText(e.target.value)}
          placeholder="Ex.: 12"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
        />
      </label>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleGenerateToken}
          disabled={!canRun}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: canRun ? '#2563eb' : '#94a3b8',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {loading ? 'Processando...' : 'Gerar token da rodada'}
        </button>

        <button
          onClick={() => (window.location.href = '/')}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Voltar
        </button>
      </div>

      {generatedToken && (
        <div style={{ display: 'grid', gap: '8px' }}>
          <div>
            <strong>Token</strong>
          </div>
          <input
            readOnly
            value={generatedToken}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #cbd5f5',
              fontFamily: 'monospace',
            }}
          />
          {expiresAt && (
            <div style={{ fontSize: '14px' }}>
              Expira em {new Date(expiresAt).toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      )}

      <hr />

      <label style={{ display: 'grid', gap: '8px' }}>
        Deletar predictions por nome (na rodada)
        <input
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="Nome do participante"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #cbd5f5',
          }}
        />
      </label>

      <button
        onClick={handleDeletePredictions}
        disabled={!canRun}
        style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: canRun ? '#dc2626' : '#94a3b8',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {loading ? 'Processando...' : 'Deletar predictions'}
      </button>
    </div>
  )
}
