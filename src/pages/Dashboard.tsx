import { useState } from 'react'
import { CalendarDays, List } from 'lucide-react'
import { MonthView } from '../components/Calendar/MonthView'
import { WeekView }  from '../components/Calendar/WeekView'

type View = 'month' | 'week'

export function Dashboard() {
  const [view, setView] = useState<View>('month')

  return (
    <div className="flex flex-col h-full">
      {/* View switcher */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <h1 className="text-white text-xl font-bold flex-1">Calendario</h1>
        <div className="flex items-center bg-zinc-900 rounded-xl p-1 gap-1">
          <button
            onClick={() => setView('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${view === 'month'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <CalendarDays size={14} />
            Mes
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${view === 'week'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
              }`}
          >
            <List size={14} />
            Semana
          </button>
        </div>
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden">
        {view === 'month' ? <MonthView /> : <WeekView />}
      </div>
    </div>
  )
}
