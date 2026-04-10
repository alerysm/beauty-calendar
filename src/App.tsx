import { useActiveTab } from './store/useStore'
import { BottomNav } from './components/Navigation/BottomNav'
import { ToastProvider } from './components/UI/Toast'
import { TodayPage }    from './pages/TodayPage'
import { Dashboard }    from './pages/Dashboard'
import { ProductsPage } from './pages/ProductsPage'
import { RulesPage }    from './pages/RulesPage'
import { SettingsPage } from './pages/SettingsPage'
import { PlannerPage }  from './pages/PlannerPage'

function PageContent() {
  const activeTab = useActiveTab()

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {activeTab === 'today'    && <TodayPage />}
      {activeTab === 'calendar' && <Dashboard />}
      {activeTab === 'planner'  && <PlannerPage />}
      {activeTab === 'products' && <ProductsPage />}
      {activeTab === 'rules'    && <RulesPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </main>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <div
        className="flex flex-col bg-zinc-950 text-white antialiased select-none"
        style={{
          height: '100dvh',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))',
        }}
      >
        <PageContent />
        <BottomNav />
      </div>
    </ToastProvider>
  )
}
