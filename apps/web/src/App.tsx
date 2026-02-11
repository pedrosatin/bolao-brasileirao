import { useMemo } from 'react'
import Layout from './components/Layout'
import Tabs, { TabKey } from './components/Tabs'
import HomePage from './pages/HomePage'
import RankingsPage from './pages/RankingsPage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'
import { useRoundData } from './hooks/useRoundData'

const getActiveTab = (pathname: string): TabKey => {
  if (pathname === '/rankings') return 'rankings'
  if (pathname === '/history') return 'history'
  return 'home'
}

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin'
  const activeTab = getActiveTab(window.location.pathname)
  const { round, matches, loading, error, refresh } = useRoundData()

  if (isAdminRoute) {
    return (
      <Layout>
        <AdminPage />
      </Layout>
    )
  }

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
      <Tabs activeTab={activeTab} />
      {content}
    </Layout>
  )
}
