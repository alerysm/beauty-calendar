import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Repeat, Plus, Trash2, X } from 'lucide-react'
import { useCustomRules, useProducts, useStore } from '../store/useStore'
import { CustomRule } from '../types'

interface Rule {
  id: string
  title: string
  description: string
  type: 'conflict' | 'limit' | 'daily' | 'info'
  products?: string[]
}

const RULES: Rule[] = [
  {
    id: 'r1',
    type: 'conflict',
    title: 'Ácido Azelaico + Retinol',
    description: 'No pueden aplicarse el mismo día. Pueden irritar la piel si se usan juntos.',
    products: ['Ácido Azelaico', 'Retinol'],
  },
  {
    id: 'r2',
    type: 'conflict',
    title: 'Ácido Azelaico + Dermaplaning',
    description: 'No pueden aplicarse el mismo día. El dermaplaning deja la piel muy sensible.',
    products: ['Ácido Azelaico', 'Dermaplaning'],
  },
  {
    id: 'r3',
    type: 'conflict',
    title: 'Retinol + Dermaplaning',
    description: 'No pueden aplicarse el mismo día. Pueden causar irritación severa.',
    products: ['Retinol', 'Dermaplaning'],
  },
  {
    id: 'r4',
    type: 'conflict',
    title: 'Máscara AHA-BHA-PHA — Conflictos',
    description: 'No puede coincidir con ácido azelaico, retinol ni dermaplaning. Son ácidos que se potencian negativamente.',
    products: ['Máscara AHA-BHA-PHA', 'Ácido Azelaico', 'Retinol', 'Dermaplaning'],
  },
  {
    id: 'r5',
    type: 'limit',
    title: 'Máscara AHA-BHA-PHA — Frecuencia',
    description: 'Máximo 2 veces por semana. Usar con más frecuencia puede dañar la barrera cutánea.',
    products: ['Máscara AHA-BHA-PHA'],
  },
  {
    id: 'r6',
    type: 'limit',
    title: 'Ácido Glicólico — Frecuencia',
    description: 'Máximo 2 veces por semana. Es un exfoliante de uso corporal.',
    products: ['Ácido Glicólico'],
  },
  {
    id: 'r7',
    type: 'limit',
    title: 'Aceite Limpiador — Frecuencia',
    description: 'Solo una vez por semana. El uso excesivo puede desequilibrar la piel.',
    products: ['Aceite Limpiador'],
  },
  {
    id: 'r8',
    type: 'daily',
    title: 'Niacinamida — Uso diario',
    description: 'Puede usarse todos los días. Compatible con todos los productos.',
    products: ['Niacinamida'],
  },
  {
    id: 'r9',
    type: 'daily',
    title: 'PDRN — Uso diario',
    description: 'Puede usarse todos los días. Compatible con todos los productos.',
    products: ['PDRN'],
  },
  {
    id: 'r10',
    type: 'daily',
    title: 'Crema — Uso diario',
    description: 'Debe aplicarse diariamente para mantener la hidratación.',
    products: ['Crema'],
  },
]

const TYPE_CONFIG = {
  conflict: {
    icon: <AlertTriangle size={16} />,
    label: 'Conflicto',
    bg: 'bg-red-950/40',
    border: 'border-red-800/40',
    iconColor: 'text-red-400',
    labelColor: 'bg-red-900/60 text-red-300',
  },
  limit: {
    icon: <Clock size={16} />,
    label: 'Límite semanal',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/30',
    iconColor: 'text-amber-400',
    labelColor: 'bg-amber-900/60 text-amber-300',
  },
  daily: {
    icon: <CheckCircle size={16} />,
    label: 'Uso diario',
    bg: 'bg-green-950/30',
    border: 'border-green-800/30',
    iconColor: 'text-green-400',
    labelColor: 'bg-green-900/60 text-green-300',
  },
  info: {
    icon: <Repeat size={16} />,
    label: 'Información',
    bg: 'bg-zinc-800/60',
    border: 'border-zinc-700/40',
    iconColor: 'text-blue-400',
    labelColor: 'bg-zinc-700 text-zinc-300',
  },
}

// ─── New rule form ────────────────────────────────────────────────────────────
interface RuleFormState {
  type: 'conflict' | 'limit'
  description: string
  productAId: string
  productBId: string
  productId: string
  maxPerWeek: number
}

function NewRuleModal({ onClose }: { onClose: () => void }) {
  const products       = useProducts()
  const addCustomRule  = useStore(s => s.addCustomRule)

  const [form, setForm] = useState<RuleFormState>({
    type: 'conflict',
    description: '',
    productAId: '',
    productBId: '',
    productId: '',
    maxPerWeek: 2,
  })

  function handleSave() {
    if (form.type === 'conflict') {
      if (!form.productAId || !form.productBId || form.productAId === form.productBId) return
      addCustomRule({
        type: 'conflict',
        description: form.description || `${getProductName(form.productAId)} + ${getProductName(form.productBId)}`,
        productAId: form.productAId,
        productBId: form.productBId,
      })
    } else {
      if (!form.productId || form.maxPerWeek < 1) return
      addCustomRule({
        type: 'limit',
        description: form.description || `${getProductName(form.productId)} — máx ${form.maxPerWeek}×/sem`,
        productId: form.productId,
        maxPerWeek: form.maxPerWeek,
      })
    }
    onClose()
  }

  function getProductName(id: string) {
    return products.find(p => p.id === id)?.name ?? id
  }

  const isValid = form.type === 'conflict'
    ? (!!form.productAId && !!form.productBId && form.productAId !== form.productBId)
    : (!!form.productId && form.maxPerWeek >= 1)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/60 rounded-3xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Nueva regla</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-4">
          {(['conflict', 'limit'] as const).map(t => (
            <button
              key={t}
              onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
                ${form.type === t
                  ? t === 'conflict' ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'
                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {t === 'conflict' ? 'Conflicto' : 'Límite semanal'}
            </button>
          ))}
        </div>

        {form.type === 'conflict' ? (
          <div className="space-y-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Producto A</label>
              <select
                value={form.productAId}
                onChange={e => setForm(f => ({ ...f, productAId: e.target.value }))}
                className="w-full bg-zinc-800 text-white text-sm rounded-xl px-3 py-2.5 border border-zinc-700/60
                  focus:outline-none focus:border-skin-500"
              >
                <option value="">Seleccionar...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">No puede combinarse con</label>
              <select
                value={form.productBId}
                onChange={e => setForm(f => ({ ...f, productBId: e.target.value }))}
                className="w-full bg-zinc-800 text-white text-sm rounded-xl px-3 py-2.5 border border-zinc-700/60
                  focus:outline-none focus:border-skin-500"
              >
                <option value="">Seleccionar...</option>
                {products.filter(p => p.id !== form.productAId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">Producto</label>
              <select
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                className="w-full bg-zinc-800 text-white text-sm rounded-xl px-3 py-2.5 border border-zinc-700/60
                  focus:outline-none focus:border-skin-500"
              >
                <option value="">Seleccionar...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1.5 block">
                Máximo por semana: <span className="text-white font-bold">{form.maxPerWeek}</span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={form.maxPerWeek}
                onChange={e => setForm(f => ({ ...f, maxPerWeek: Number(e.target.value) }))}
                className="w-full accent-skin-500"
              />
              <div className="flex justify-between text-zinc-600 text-[10px] mt-0.5">
                {[1,2,3,4,5,6,7].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Optional description */}
        <div className="mt-3">
          <label className="text-zinc-400 text-xs mb-1.5 block">Descripción (opcional)</label>
          <input
            type="text"
            placeholder="Ej: No mezclar para evitar irritación"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-xl px-3 py-2.5 border border-zinc-700/60
              focus:outline-none focus:border-skin-500 placeholder:text-zinc-600"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-3 rounded-2xl bg-skin-500 hover:bg-skin-400 text-white font-semibold
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function RulesPage() {
  const customRules    = useCustomRules()
  const products       = useProducts()
  const deleteCustomRule = useStore(s => s.deleteCustomRule)
  const [showForm, setShowForm] = useState(false)

  function getProductName(id?: string) {
    if (!id) return ''
    return products.find(p => p.id === id)?.name ?? id
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-white text-xl font-bold">Reglas de compatibilidad</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Estas reglas se validan automáticamente al agregar productos al calendario
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
        {RULES.map(rule => {
          const config = TYPE_CONFIG[rule.type]
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={config.iconColor}>{config.icon}</span>
                  <h3 className="text-white font-semibold text-sm">{rule.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${config.labelColor}`}>
                  {config.label}
                </span>
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                {rule.description}
              </p>

              {rule.products && (
                <div className="flex flex-wrap gap-1.5">
                  {rule.products.map(p => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg
                        text-zinc-300 text-[11px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* ── Custom rules section ───────────────────────────────────── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">
              Mis reglas personalizadas
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-skin-500/20 text-skin-400
                hover:bg-skin-500/30 transition-colors text-xs font-semibold"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {customRules.length === 0 ? (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 text-center">
              <p className="text-zinc-600 text-sm">
                Aún no tienes reglas personalizadas.
              </p>
              <p className="text-zinc-700 text-xs mt-1">
                Crea conflictos o límites de frecuencia para tus productos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customRules.map(rule => {
                const isConflict = rule.type === 'conflict'
                const config     = isConflict ? TYPE_CONFIG.conflict : TYPE_CONFIG.limit

                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-2xl border ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={config.iconColor}>{config.icon}</span>
                        <h3 className="text-white font-semibold text-sm">{rule.description}</h3>
                      </div>
                      <button
                        onClick={() => deleteCustomRule(rule.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isConflict ? (
                        <>
                          <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-zinc-300 text-[11px] font-medium">
                            {getProductName(rule.productAId)}
                          </span>
                          <span className="text-zinc-600 text-[11px] self-center">vs</span>
                          <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-zinc-300 text-[11px] font-medium">
                            {getProductName(rule.productBId)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-zinc-300 text-[11px] font-medium">
                            {getProductName(rule.productId)}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-900/40 border border-amber-800/40 rounded-lg text-amber-300 text-[11px] font-medium">
                            Máx {rule.maxPerWeek}×/semana
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && <NewRuleModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
