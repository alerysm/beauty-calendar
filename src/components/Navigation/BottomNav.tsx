import { CalendarDays, Package, BookOpen, Settings, Sun, Sparkles } from 'lucide-react'
import { TabType } from '../../types'
import { useStore, useActiveTab } from '../../store/useStore'

const TABS: { id: TabType; label: string; Icon: typeof Sun }[] = [
  { id: 'today',    label: 'Hoy',      Icon: Sun },
  { id: 'calendar', label: 'Calendario', Icon: CalendarDays },
  { id: 'planner',  label: 'Plan',     Icon: Sparkles },
  { id: 'products', label: 'Productos', Icon: Package },
  { id: 'rules',    label: 'Reglas',   Icon: BookOpen },
  { id: 'settings', label: 'Config',   Icon: Settings },
]

export function BottomNav() {
  const activeTab   = useActiveTab()
  const setActiveTab = useStore(s => s.setActiveTab)

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl
        border-t border-zinc-800/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-200
                ${active ? 'text-skin-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200
                ${active ? 'bg-skin-400/15' : ''}`}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                />
              </div>
              <span className={`text-[10px] font-medium leading-none transition-all
                ${active ? 'text-skin-400' : 'text-zinc-500'}`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
