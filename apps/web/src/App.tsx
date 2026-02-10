import { useMemo, useState } from 'react'
import Layout from './components/Layout'
import Tabs, { TabKey } from './components/Tabs'
import HomePage from './pages/HomePage'
import RankingsPage from './pages/RankingsPage'
import HistoryPage from './pages/HistoryPage'
import { useRoundData } from './hooks/useRoundData'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const { round, matches, loading, error, refresh } = useRoundData()

  const content = useMemo(() => {
    if (activeTab === 'home') {
      return (
        <HomePage
          round={round}
          matches={matches}
          loading={loading}
          error={error}
          onRefresh={refresh}
        />
      )
    }

    if (activeTab === 'rankings') {
      return <RankingsPage round={round} />
    }

    return <HistoryPage />
  }, [activeTab, round, matches, loading, error, refresh])

  return (
    <Layout>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />
      {content}
    </Layout>
  )
}
