import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useProducts, useCalendar } from '../../store/useStore'
import { DayModal } from './DayModal'
import {
  getWeekDays,
  isToday,
  toDateStr,
  addWeeks,
  subWeeks,
  format,
  es,
} from '../../utils/dateUtils'

export function WeekView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const products = useProducts()
  const calendar = useCalendar()

  const weekDays = getWeekDays(currentDate)
  const weekLabel = `${format(weekDays[0], 'd MMM', { locale: es })} – ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setCurrentDate(d => subWeeks(d, 1))}
          className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-semibold text-base capitalize">{weekLabel}</h2>
        <button
          onClick={() => setCurrentDate(d => addWeeks(d, 1))}
          className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week grid */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {weekDays.map(day => {
          const dateStr = toDateStr(day)
          const today   = isToday(day)
          const entry   = calendar[dateStr]
          const morning = entry?.morning ?? []
          const night   = entry?.night   ?? []

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-150
                ${today
                  ? 'bg-skin-400/10 border-skin-400/30'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold capitalize
                    ${today ? 'text-skin-400' : 'text-zinc-200'}`}
                  >
                    {format(day, 'EEEE', { locale: es })}
                  </span>
                  {today && (
                    <span className="px-2 py-0.5 bg-skin-400/20 rounded-full text-skin-400 text-[10px] font-semibold">
                      HOY
                    </span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${today ? 'text-skin-400' : 'text-zinc-400'}`}>
                  {format(day, 'd MMM', { locale: es })}
                </span>
              </div>

              {/* Products */}
              {(morning.length > 0 || night.length > 0) ? (
                <div className="space-y-2">
                  {morning.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Sun size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {morning.map(id => {
                          const p = products.find(pr => pr.id === id)
                          if (!p) return null
                          return (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: p.color + '30', color: p.color }}
                            >
                              {p.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {night.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Moon size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {night.map(id => {
                          const p = products.find(pr => pr.id === id)
                          if (!p) return null
                          return (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: p.color + '30', color: p.color }}
                            >
                              {p.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-600 text-xs italic">Sin productos programados</p>
              )}
            </button>
          )
        })}
      </div>

      <DayModal dateStr={selectedDate} onClose={() => setSelectedDate(null)} />
    </div>
  )
}
