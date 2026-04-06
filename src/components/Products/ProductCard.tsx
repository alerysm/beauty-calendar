import { useState } from 'react'
import { Edit2, Trash2, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react'
import { Product, FREQUENCY_LABELS } from '../../types'
import { ProductForm } from './ProductForm'
import { useStore } from '../../store/useStore'
import { useToast } from '../UI/Toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const { deleteProduct } = useStore()
  const { showToast } = useToast()

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      deleteProduct(product.id)
      showToast(`"${product.name}" eliminado`, 'info')
    }
  }

  const usageIcon = product.usage === 'morning' ? <Sun size={13} className="text-amber-400" />
    : product.usage === 'night' ? <Moon size={13} className="text-indigo-400" />
    : <><Sun size={13} className="text-amber-400" /><Moon size={13} className="text-indigo-400" /></>

  return (
    <>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden
          transition-all duration-200"
        style={{ borderLeftColor: product.color, borderLeftWidth: 3 }}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Color dot */}
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: product.color }}
          />

          {/* Name + frequency */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                {usageIcon}
              </div>
              <span className="text-zinc-500 text-xs">
                {FREQUENCY_LABELS[product.frequency]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-xl text-zinc-500 hover:text-skin-400 hover:bg-skin-400/10
                transition-colors"
            >
              <Edit2 size={15} />
            </button>
            {!product.isDefault && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30
                  transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Expanded notes */}
        {expanded && product.notes && (
          <div className="px-4 pb-4">
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-zinc-400 text-xs leading-relaxed">{product.notes}</p>
            </div>
          </div>
        )}
      </div>

      <ProductForm open={editing} onClose={() => setEditing(false)} product={product} />
    </>
  )
}
