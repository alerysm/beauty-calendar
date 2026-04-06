import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useCalendar } from '../../store/useStore'
import { DayModal } from './DayModal'
import {
  getMonthDays,
  isToday,
  isSameMonth,
  toDateStr,
  addMonths,
  subMonths,
  format,
  es,
} from '../../utils/dateUtils'
import { getDayConflicts } from '../../utils/rulesEngine'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MonthView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const products = useProducts()
  const calendar = useCalendar()

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days  = getMonthDays(year, month)

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: es })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setCurrentDate(d => subMonths(d, 1))}
          className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-semibold capitalize text-lg">{monthLabel}</h2>
        <button
          onClick={() => setCurrentDate(d => addMonths(d, 1))}
          className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-zinc-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 px-3 flex-1">
        {days.map(day => {
          const dateStr    = toDateStr(day)
          const inMonth    = isSameMonth(day, new Date(year, month))
          const today      = isToday(day)
          const entry      = calendar[dateStr]
          const allIds     = [...(entry?.morning ?? []), ...(entry?.night ?? [])]
          const hasConflict = getDayConflicts(dateStr, calendar, products).length > 0

          // Unique colors for dots
          const dotColors = [...new Set(
            allIds
              .map(id => products.find(p => p.id === id)?.color)
              .filter(Boolean) as string[]
          )].slice(0, 4)

          return (
            <button
              key={dateStr}
              onClick={() => inMonth && setSelectedDate(dateStr)}
              disabled={!inMonth}
              className={`relative flex flex-col items-center justify-start py-1.5 rounded-2xl
                transition-all duration-150 min-h-[56px]
                ${!inMonth ? 'opacity-20 cursor-default' : 'hover:bg-zinc-800/60 active:scale-95'}
                ${today ? 'bg-skin-400/15 ring-1 ring-skin-400/40' : ''}
              `}
            >
              {/* Day number */}
              <span className={`text-sm font-semibold leading-none mb-1
                ${today ? 'text-skin-400' : inMonth ? 'text-zinc-200' : 'text-zinc-600'}`}
              >
                {day.getDate()}
              </span>

              {/* Product dots */}
              {dotColors.length > 0 && (
                <div className="flex flex-wrap justify-center gap-[3px] max-w-[40px]">
                  {dotColors.map((color, i) => (
                    <span
                      key={i}
                      className="w-[6px] h-[6px] rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}

              {/* Conflict indicator */}
              {hasConflict && inMonth && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 flex items-center gap-4 border-t border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-skin-400" />
          <span className="text-zinc-500 text-xs">Hoy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-zinc-500 text-xs">Conflicto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
          <span className="text-zinc-500 text-xs">Producto</span>
        </div>
      </div>

      {/* Day modal */}
      <DayModal dateStr={selectedDate} onClose={() => setSelectedDate(null)} />
    </div>
  )
}
