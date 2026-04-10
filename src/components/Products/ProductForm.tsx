import { useState } from 'react'
import { X } from 'lucide-react'
import { Product, ProductType, UsageTime, FrequencyType, PRODUCT_COLORS, PRODUCT_LABELS, FREQUENCY_LABELS } from '../../types'
import { useStore } from '../../store/useStore'
import { useToast } from '../UI/Toast'
import { Modal } from '../UI/Modal'

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: Product // if editing
}

const PRODUCT_TYPES: ProductType[] = [
  'azelaic_acid', 'retinol', 'dermaplaning', 'aha_bha_pha_mask',
  'niacinamide', 'pdrn', 'cleansing_oil', 'cream', 'glycolic_acid', 'custom',
]

const USAGE_OPTIONS: { value: UsageTime; label: string }[] = [
  { value: 'morning', label: 'Mañana' },
  { value: 'night',   label: 'Noche' },
  { value: 'both',    label: 'Mañana y noche' },
]

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'daily',     label: 'Diario' },
  { value: 'weekly_6',  label: '6×/semana' },
  { value: 'weekly_5',  label: '5×/semana' },
  { value: 'weekly_4',  label: '4×/semana' },
  { value: 'weekly_3',  label: '3×/semana' },
  { value: 'weekly_2',  label: '2×/semana' },
  { value: 'weekly_1',  label: '1×/semana' },
  { value: 'biweekly',  label: 'Quincenal' },
  { value: 'monthly',   label: '1×/mes' },
  { value: 'as_needed', label: 'Según necesidad' },
]

const PRESET_COLORS = [
  '#a78bfa', '#f97316', '#06b6d4', '#ec4899', '#22c55e',
  '#3b82f6', '#eab308', '#e8b4b8', '#14b8a6', '#8b5cf6',
  '#ef4444', '#84cc16', '#f59e0b', '#6366f1', '#10b981',
]

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const { addProduct, updateProduct } = useStore()
  const { showToast } = useToast()

  const [name,      setName]      = useState(product?.name      ?? '')
  const [type,      setType]      = useState<ProductType>(product?.type ?? 'custom')
  const [usage,     setUsage]     = useState<UsageTime>(product?.usage ?? 'both')
  const [frequency, setFrequency] = useState<FrequencyType>(product?.frequency ?? 'daily')
  const [color,     setColor]     = useState(product?.color ?? PRODUCT_COLORS.custom)
  const [notes,     setNotes]     = useState(product?.notes ?? '')

  const handleTypeChange = (t: ProductType) => {
    setType(t)
    if (t !== 'custom') {
      setName(PRODUCT_LABELS[t])
      setColor(PRODUCT_COLORS[t])
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      showToast('Ingresa un nombre para el producto', 'error')
      return
    }

    if (product) {
      updateProduct(product.id, { name, type, usage, frequency, color, notes })
      showToast('Producto actualizado', 'success')
    } else {
      addProduct({ name, type, usage, frequency, color, notes })
      showToast('Producto agregado', 'success')
    }

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Editar producto' : 'Nuevo producto'}
    >
      <div className="px-5 py-4 space-y-5 pb-8">

        {/* Type */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Tipo de producto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all
                  ${type === t
                    ? 'bg-skin-400/20 border border-skin-400/50 text-skin-300'
                    : 'bg-zinc-800 border border-transparent text-zinc-400 hover:bg-zinc-700'
                  }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: PRODUCT_COLORS[t] }}
                />
                {PRODUCT_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Nombre
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del producto"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl
              text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-skin-400
              transition-colors"
          />
        </div>

        {/* Usage */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Uso
          </label>
          <div className="flex gap-2">
            {USAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setUsage(opt.value)}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${usage === opt.value
                    ? 'bg-skin-400/20 text-skin-300 border border-skin-400/40'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Frecuencia
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {FREQUENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${frequency === opt.value
                    ? 'bg-skin-400/20 text-skin-300 border border-skin-400/40'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Color en calendario
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all
                  ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Instrucciones, marca, recordatorios..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl
              text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-skin-400
              transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-skin-400 rounded-2xl text-zinc-950 font-semibold text-sm
            hover:bg-skin-300 active:scale-[0.98] transition-all"
        >
          {product ? 'Guardar cambios' : 'Agregar producto'}
        </button>
      </div>
    </Modal>
  )
}
