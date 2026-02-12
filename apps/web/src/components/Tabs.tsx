export type TabKey = 'home' | 'rankings' | 'history'

type TabsProps = {
  activeTab: TabKey
}

const tabs: { key: TabKey; label: string; href: string }[] = [
  { key: 'home', label: 'Palpites', href: '/' },
  { key: 'rankings', label: 'Ranking', href: '/rankings' },
  { key: 'history', label: 'Histórico', href: '/history' },
]

export default function Tabs({ activeTab }: TabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <a
            key={tab.key}
            href={tab.href}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: isActive ? 'var(--color-accent-blue)' : 'var(--color-bg-hover)',
              color: isActive ? '#fff' : 'var(--color-text-primary)',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {tab.label}
          </a>
        )
      })}
    </div>
  )
}
