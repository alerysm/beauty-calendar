import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { ProductCard } from '../components/Products/ProductCard'
import { ProductForm } from '../components/Products/ProductForm'
import { useProducts } from '../store/useStore'

export function ProductsPage() {
  const products = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-bold">Productos</h1>
            <p className="text-zinc-500 text-sm">{products.length} productos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-skin-400 rounded-2xl
              text-zinc-950 font-semibold text-sm hover:bg-skin-300 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl
              text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-skin-400
              transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-zinc-500 text-sm">No se encontraron productos</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-skin-400 text-sm font-medium"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filtered.map(p => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <ProductForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
