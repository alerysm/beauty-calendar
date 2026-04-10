import { useState } from 'react'
import { Sun, Moon, AlertTriangle, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { useProducts, useCalendar, useCustomRules } from '../store/useStore'
import { DayModal } from '../components/Calendar/DayModal'
import { getDayConflicts } from '../utils/rulesEngine'
import { toDateStr, formatDisplay, formatDayName, format, es } from '../utils/dateUtils'
import { Product } from '../types'

export function TodayPage() {
  const products    = useProducts()
  const calendar    = useCalendar()
  const customRules = useCustomRules()

  const today = toDateStr(new Date())
  const entry = calendar[today] ?? { date: today, morning: [], night: [] }
  const conflicts = getDayConflicts(today, calendar, products, customRules)

  const [showDayModal, setShowDayModal] = useState(false)

  const getProduct = (id: string) => products.find(p => p.id === id)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return '¡Buenos días mi amor! 🌅'
    if (h < 18) return '¡Buenas tardes mi amor! ☀️'
    return '¡Buenas noches mi amor! 🌙'
  })()

  return (
    <div className="flex flex-col min-h-full px-5 py-6 space-y-6">

      {/* Greeting */}
      <div>
        <p className="text-zinc-400 text-sm font-medium capitalize">
          {formatDayName(today)}, {formatDisplay(today, 'd MMMM yyyy')}
        </p>
        <h1 className="text-white text-2xl font-bold mt-1">{greeting}</h1>
        <p className="text-zinc-500 text-sm mt-1">Tu rutina de skincare de hoy</p>
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-red-950/60 border border-red-800/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-300 font-semibold text-sm">
              {conflicts.length} conflicto{conflicts.length > 1 ? 's' : ''} detectado{conflicts.length > 1 ? 's' : ''}
            </p>
          </div>
          {conflicts.map((c, i) => (
            <p key={i} className="text-red-400 text-xs leading-relaxed">{c.message}</p>
          ))}
        </div>
      )}

      {/* Morning routine */}
      <RoutineSection
        title="Rutina de mañana"
        icon={<Sun size={18} className="text-amber-400" />}
        productIds={entry.morning}
        getProduct={getProduct}
        emptyText="Sin productos para la mañana"
        gradient="from-amber-950/40 to-transparent"
      />

      {/* Night routine */}
      <RoutineSection
        title="Rutina de noche"
        icon={<Moon size={18} className="text-indigo-400" />}
        productIds={entry.night}
        getProduct={getProduct}
        emptyText="Sin productos para la noche"
        gradient="from-indigo-950/40 to-transparent"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Productos hoy" value={entry.morning.length + entry.night.length} />
        <StatCard label="Mañana" value={entry.morning.length} />
        <StatCard label="Noche" value={entry.night.length} />
      </div>

      {/* Edit day button */}
      <button
        onClick={() => setShowDayModal(true)}
        className="flex items-center justify-between w-full px-5 py-4 bg-skin-400/10
          border border-skin-400/20 rounded-2xl hover:bg-skin-400/15 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-skin-400/20 rounded-xl">
            <Sparkles size={18} className="text-skin-400" />
          </div>
          <div className="text-left">
            <p className="text-skin-300 font-semibold text-sm">Editar rutina de hoy</p>
            <p className="text-zinc-500 text-xs">Agregar o quitar productos</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-zinc-500 group-hover:text-skin-400 transition-colors" />
      </button>

      <DayModal dateStr={showDayModal ? today : null} onClose={() => setShowDayModal(false)} />
    </div>
  )
}

interface RoutineSectionProps {
  title: string
  icon: React.ReactNode
  productIds: string[]
  getProduct: (id: string) => Product | undefined
  emptyText: string
  gradient: string
}

function RoutineSection({ title, icon, productIds, getProduct, emptyText, gradient }: RoutineSectionProps) {
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} bg-zinc-900 border border-zinc-800`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-white font-semibold">{title}</h2>
        <span className="ml-auto px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400 text-xs">
          {productIds.length}
        </span>
      </div>

      {productIds.length === 0 ? (
        <p className="text-zinc-600 text-sm italic text-center py-3">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {productIds.map(id => {
            const p = getProduct(id)
            if (!p) return null
            return (
              <div key={id} className="flex items-center gap-3 py-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <p className="text-zinc-200 text-sm font-medium">{p.name}</p>
                {p.notes && (
                  <p className="text-zinc-500 text-xs ml-auto truncate max-w-[120px]">{p.notes.split('.')[0]}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
    </div>
  )
}
