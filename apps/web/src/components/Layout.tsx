import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Bolão Brasileirão</h1>
      </header>
      <main style={{ flexGrow: 1 }}>{children}</main>
      <footer style={{ marginTop: '32px', fontSize: '14px', color: '#4b5563' }}>
        Criado por{' '}
        <a
          href="https://github.com/pedrosatin"
          target="_blank"
          rel="noreferrer"
        >
          @pedrosatin
        </a>
      </footer>
    </div>
  )
}
