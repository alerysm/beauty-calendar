import { useState } from 'react'
import { Plus, Trash2, Sun, Moon, AlertTriangle } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { ValidationAlert } from '../UI/ValidationAlert'
import { useStore, useProducts, useCalendar } from '../../store/useStore'
import { useToast } from '../UI/Toast'
import { ValidationResult, Product } from '../../types'
import { formatDisplay, formatDayName } from '../../utils/dateUtils'
import { getDayConflicts } from '../../utils/rulesEngine'

interface DayModalProps {
  dateStr: string | null
  onClose: () => void
}

export function DayModal({ dateStr, onClose }: DayModalProps) {
  const products   = useProducts()
  const calendar   = useCalendar()
  const { addProductToDay, removeProductFromDay, addProductToMonth } = useStore()
  const { showToast } = useToast()

  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [selectedTime, setSelectedTime] = useState<'morning' | 'night'>('morning')
  const [showPicker, setShowPicker] = useState(false)
  const [repeatMonth, setRepeatMonth] = useState(false)

  if (!dateStr) return null

  const entry = calendar[dateStr] ?? { date: dateStr, morning: [], night: [] }
  const conflicts = getDayConflicts(dateStr, calendar, products)

  const getProduct = (id: string) => products.find(p => p.id === id)

  const handleAdd = (productId: string) => {
    if (repeatMonth) {
      const yearMonth = dateStr.slice(0, 7)
      const { applied, skipped } = addProductToMonth(yearMonth, productId, selectedTime)
      showToast(
        skipped > 0
          ? `Agregado a ${applied} días (${skipped} omitidos por conflicto)`
          : `Agregado a ${applied} días del mes`,
        'success',
      )
      setShowPicker(false)
      setRepeatMonth(false)
    } else {
      const result = addProductToDay(dateStr, productId, selectedTime)
      if (!result.valid) {
        setValidation(result)
      } else {
        showToast('Producto agregado', 'success')
        setShowPicker(false)
      }
    }
  }

  const handleRemove = (productId: string, time: 'morning' | 'night') => {
    removeProductFromDay(dateStr, productId, time)
    showToast('Producto eliminado', 'info')
  }

  // Products not yet on the selected time slot
  const usedInSlot = new Set(entry[selectedTime])
  const availableProducts = products.filter(p => !usedInSlot.has(p.id))

  return (
    <>
      {validation && (
        <ValidationAlert
          result={validation}
          onClose={() => setValidation(null)}
        />
      )}

      <Modal open={!!dateStr} onClose={onClose} title={`${formatDayName(dateStr)}, ${formatDisplay(dateStr)}`}>
        <div className="px-5 py-4 space-y-5 pb-8">

          {/* Conflicts warning */}
          {conflicts.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-950/60 border border-red-800/40 rounded-2xl">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">Conflictos activos</p>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-red-400 text-xs">{c.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Morning */}
          <Section
            title="Rutina de mañana"
            icon={<Sun size={16} className="text-amber-400" />}
            productIds={entry.morning}
            getProduct={getProduct}
            onRemove={id => handleRemove(id, 'morning')}
            onAdd={() => { setSelectedTime('morning'); setShowPicker(true) }}
          />

          {/* Night */}
          <Section
            title="Rutina de noche"
            icon={<Moon size={16} className="text-indigo-400" />}
            productIds={entry.night}
            getProduct={getProduct}
            onRemove={id => handleRemove(id, 'night')}
            onAdd={() => { setSelectedTime('night'); setShowPicker(true) }}
          />

          {/* Product picker */}
          {showPicker && (
            <div className="mt-2">
              <p className="text-zinc-400 text-sm font-medium mb-3">
                Agregar a {selectedTime === 'morning' ? 'mañana' : 'noche'}:
              </p>

              {/* Repeat month toggle */}
              <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={repeatMonth}
                  onChange={e => setRepeatMonth(e.target.checked)}
                  className="w-4 h-4 rounded accent-skin-400"
                />
                <span className="text-zinc-400 text-sm">Repetir todo el mes</span>
              </label>

              {availableProducts.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">
                  Todos los productos ya están en esta rutina
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {availableProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAdd(product.id)}
                      className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-2xl
                        hover:bg-zinc-700 transition-colors text-left"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: product.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{product.name}</p>
                        <p className="text-zinc-500 text-xs capitalize">
                          {product.usage === 'morning' ? 'Mañana' :
                           product.usage === 'night' ? 'Noche' : 'Mañana y noche'}
                        </p>
                      </div>
                      <Plus size={16} className="text-zinc-500" />
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowPicker(false); setRepeatMonth(false) }}
                className="mt-3 w-full py-2 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  productIds: string[]
  getProduct: (id: string) => Product | undefined
  onRemove: (id: string) => void
  onAdd: () => void
}

function Section({ title, icon, productIds, getProduct, onRemove, onAdd }: SectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-zinc-200 text-sm font-semibold">{title}</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-skin-400/15 border border-skin-400/30
            rounded-xl text-skin-400 text-xs font-medium hover:bg-skin-400/25 transition-colors"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {productIds.length === 0 ? (
        <div className="py-6 flex flex-col items-center gap-2 bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-700">
          <p className="text-zinc-500 text-sm">Sin productos</p>
          <button
            onClick={onAdd}
            className="text-skin-400 text-xs font-medium hover:text-skin-300 transition-colors"
          >
            + Agregar producto
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {productIds.map(id => {
            const product = getProduct(id)
            if (!product) return null
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-800/60 rounded-2xl
                  border border-zinc-700/40"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: product.color }}
                />
                <p className="text-white text-sm font-medium flex-1 truncate">{product.name}</p>
                <button
                  onClick={() => onRemove(id)}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30
                    transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
