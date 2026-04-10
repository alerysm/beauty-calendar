import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  CheckSquare,
  Square,
  Sun,
  Moon,
  Repeat2,
  Info,
} from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useProducts, useCustomRules, useStore } from '../store/useStore'
import { generateRecommendation } from '../utils/recommendationEngine'
import { ProductSchedule, FREQUENCY_LABELS } from '../types'
import { useToast } from '../components/UI/Toast'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const FREQ_LABEL = FREQUENCY_LABELS

function toYearMonth(date: Date) {
  return format(date, 'yyyy-MM')
}

export function PlannerPage() {
  const products    = useProducts()
  const customRules = useCustomRules()
  const applyMonthlyPlan = useStore(s => s.applyMonthlyPlan)
  const { showToast } = useToast()

  const [currentDate, setCurrentDate]           = useState(() => new Date())
  const [selectedIds, setSelectedIds]           = useState<Set<string>>(() => new Set(
    // Pre-select all products that are not 'as_needed' by default
    products.filter(p => p.frequency !== 'as_needed').map(p => p.id),
  ))
  const [schedules, setSchedules]               = useState<ProductSchedule[] | null>(null)
  const [showConfirm, setShowConfirm]           = useState(false)

  const yearMonth    = toYearMonth(currentDate)
  const monthLabel   = format(currentDate, 'MMMM yyyy', { locale: es })
    .replace(/^\w/, c => c.toUpperCase())

  // When month changes, reset schedules
  function handlePrevMonth() {
    setCurrentDate(d => subMonths(d, 1))
    setSchedules(null)
  }
  function handleNextMonth() {
    setCurrentDate(d => addMonths(d, 1))
    setSchedules(null)
  }

  function toggleProduct(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSchedules(null)
  }

  function handleGenerate() {
    const rec = generateRecommendation(products, [...selectedIds], customRules)
    setSchedules(rec)
  }

  function handleApply() {
    if (!schedules) return
    applyMonthlyPlan(yearMonth, schedules)
    setShowConfirm(false)
    showToast(`Plan aplicado a ${monthLabel}`, 'success')
  }

  // Build a lookup: productId → schedule
  const scheduleMap = useMemo(() => {
    const map: Record<string, ProductSchedule> = {}
    if (schedules) schedules.forEach(s => { map[s.productId] = s })
    return map
  }, [schedules])

  // Get products for a given dayOfWeek and time
  function getProductsForDay(dayOfWeek: number, time: 'morning' | 'night') {
    if (!schedules) return []
    return schedules
      .filter(s =>
        s.daysOfWeek.includes(dayOfWeek) &&
        (s.time === time || s.time === 'both'),
      )
      .map(s => products.find(p => p.id === s.productId))
      .filter(Boolean)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <Sparkles size={20} className="text-skin-400" />
          Planificador mensual
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Selecciona tus productos y genera un plan optimizado para todo el mes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
        {/* Month selector */}
        <div className="flex items-center justify-between bg-zinc-900 rounded-2xl px-4 py-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-semibold">{monthLabel}</span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Product selection */}
        <div>
          <h2 className="text-zinc-300 text-sm font-semibold mb-3 uppercase tracking-wider">
            Productos del mes
          </h2>
          <div className="space-y-2">
            {products.map(product => {
              const isSelected = selectedIds.has(product.id)
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all
                    ${isSelected
                      ? 'bg-zinc-800/80 border-zinc-700/60'
                      : 'bg-zinc-900/60 border-zinc-800/40 opacity-60'
                    }`}
                >
                  {/* Color dot */}
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: product.color }}
                  />

                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-medium leading-tight">{product.name}</p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      {FREQ_LABEL[product.frequency]} ·{' '}
                      {product.usage === 'morning' ? 'Mañana'
                        : product.usage === 'night' ? 'Noche'
                        : 'AM + PM'}
                    </p>
                  </div>

                  {isSelected
                    ? <CheckSquare size={18} className="text-skin-400 shrink-0" />
                    : <Square size={18} className="text-zinc-600 shrink-0" />
                  }
                </button>
              )
            })}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={selectedIds.size === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold
            bg-skin-500 hover:bg-skin-400 text-white transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles size={18} />
          Generar recomendación
        </button>

        {/* Weekly plan preview */}
        {schedules && (
          <div>
            <h2 className="text-zinc-300 text-sm font-semibold mb-3 uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck size={14} className="text-skin-400" />
              Plan semanal recomendado
            </h2>

            {/* Info note */}
            <div className="flex items-start gap-2 bg-zinc-900/60 border border-zinc-800/40 rounded-xl p-3 mb-3">
              <Info size={14} className="text-zinc-500 mt-0.5 shrink-0" />
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Este patrón se repetirá cada semana del mes. Los productos con conflictos están asignados a días separados automáticamente.
              </p>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {DAY_NAMES.map((name, dayIndex) => {
                const morningProds = getProductsForDay(dayIndex, 'morning')
                const nightProds   = getProductsForDay(dayIndex, 'night')
                const hasAny = morningProds.length > 0 || nightProds.length > 0

                return (
                  <div
                    key={dayIndex}
                    className={`rounded-xl p-1.5 flex flex-col gap-1 min-h-[80px]
                      ${hasAny ? 'bg-zinc-900/80 border border-zinc-800/40' : 'bg-zinc-900/30'}`}
                  >
                    <p className={`text-center text-[10px] font-semibold mb-0.5
                      ${hasAny ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {name}
                    </p>

                    {morningProds.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        <Sun size={8} className="text-amber-400 w-full text-center mb-0.5" />
                        {morningProds.map(p => p && (
                          <span
                            key={p.id}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: p.color }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    )}

                    {nightProds.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        <Moon size={8} className="text-indigo-400 w-full text-center mb-0.5" />
                        {nightProds.map(p => p && (
                          <span
                            key={p.id}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: p.color }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    )}

                    {!hasAny && (
                      <p className="text-zinc-700 text-[9px] text-center mt-auto mb-auto">—</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-3 mb-4">
              <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
                Leyenda
              </p>
              <div className="flex flex-wrap gap-2">
                {schedules.map(s => {
                  const p = products.find(pr => pr.id === s.productId)
                  if (!p) return null
                  return (
                    <div key={s.productId} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: p.color }}
                      />
                      <span className="text-zinc-300 text-[11px]">{p.name}</span>
                      <span className="text-zinc-600 text-[10px]">
                        ({s.daysOfWeek.map(d => DAY_NAMES[d]).join(', ')})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold
                bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Repeat2 size={18} />
              Aplicar al mes de {monthLabel}
            </button>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-2">¿Aplicar plan al mes?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Esto reemplazará todo el calendario de <strong className="text-white">{monthLabel}</strong> con el plan recomendado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
