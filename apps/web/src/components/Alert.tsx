type AlertProps = {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Alert({ type, message }: AlertProps) {
  const styles: Record<AlertProps['type'], string> = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        padding: '12px 16px',
        background: '#f1f5f9',
        color: styles[type],
        fontWeight: 600,
        marginBottom: '16px',
      }}
    >
      {message}
    </div>
  )
}
