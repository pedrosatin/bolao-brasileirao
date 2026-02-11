import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Bolão Brasileirão</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}
