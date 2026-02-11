import { useMemo, useState } from 'react'
import Alert from '../components/Alert'
import {
  adminDeletePredictionsByName,
  adminGenerateSubmissionToken,
  adminSyncFinishedMatches,
  adminRecalculateRound,
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

  const adminTokenFilled = adminToken.trim().length > 0
  const canRun = adminTokenFilled && roundIdValid && !loading
  const canSync = adminTokenFilled && !loading

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

  const handleSyncFinishedMatchesClick = async () => {
    setError(null)
    setSuccess(null)

    if (!canSync) {
      setError('Informe o ADMIN token.')
      return
    }

    setLoading(true)
    try {
      const result = await adminSyncFinishedMatches(adminToken.trim())
      setSuccess(`Sincronização finalizada: ${result.message}`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao sincronizar partidas finalizadas',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateRound = async () => {
    setError(null)
    setSuccess(null)

    if (!canRun) {
      setError('Informe ADMIN token e o id da rodada.')
      return
    }

    setLoading(true)
    try {
      const result = await adminRecalculateRound(roundId, adminToken.trim())
      setSuccess(
        `Pontuação da rodada ${result.roundId} recalculada (${result.message}).`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recalcular pontos')
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

      <div
        style={{
          display: 'grid',
          gap: '12px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ fontWeight: 600 }}>Sincronizar partidas finalizadas</div>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
          Busca os resultados confirmados na Football-Data e atualiza as
          partidas da rodada atual antes do recálculo.
        </p>
        <button
          onClick={handleSyncFinishedMatchesClick}
          disabled={!canSync}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: canSync ? '#0ea5e9' : '#94a3b8',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {loading ? 'Processando...' : 'Sincronizar resultados'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ fontWeight: 600 }}>Reprocessar pontuação da rodada</div>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
          Força a leitura dos resultados gravados na rodada e recalcula os
          pontos de todos os participantes.
        </p>
        <button
          onClick={handleRecalculateRound}
          disabled={!canRun}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: canRun ? '#15803d' : '#94a3b8',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {loading ? 'Processando...' : 'Recalcular pontuação'}
        </button>
      </div>

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
