type AlertProps = {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Alert({ type, message }: AlertProps) {
  const styles: Record<AlertProps['type'], string> = {
    success: 'var(--color-accent-success)',
    error: 'var(--color-accent-error)',
    info: 'var(--color-accent-info)',
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        padding: '12px 16px',
        background: 'var(--color-bg-muted)',
        color: styles[type],
        fontWeight: 600,
        marginBottom: '16px',
      }}
    >
      {message}
    </div>
  )
}
