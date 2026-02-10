export type TabKey = 'home' | 'rankings' | 'history'

type TabsProps = {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Palpites' },
  { key: 'rankings', label: 'Ranking' },
  { key: 'history', label: 'Histórico' },
]

export default function Tabs({ activeTab, onChange }: TabsProps) {
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
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: isActive ? '#2563eb' : '#e2e8f0',
              color: isActive ? '#fff' : '#0f172a',
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
