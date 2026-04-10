import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Repeat, Plus, Trash2, X, Pencil, SunMoon, Timer, Sun, Moon } from 'lucide-react'
import { useCustomRules, useProducts, useStore } from '../store/useStore'
import { CustomRule, RulePeriodicityType, PERIODICITY_SHORT } from '../types'

// Informational daily-use cards (not validated, not editable)
const DAILY_INFO = [
  { id: 'info-1', title: 'Niacinamida — Uso diario',  description: 'Puede usarse todos los días. Compatible con todos los productos.' },
  { id: 'info-2', title: 'PDRN — Uso diario',          description: 'Puede usarse todos los días. Compatible con todos los productos.' },
  { id: 'info-3', title: 'Crema — Uso diario',         description: 'Debe aplicarse diariamente para mantener la hidratación.' },
]

const TYPE_CONFIG = {
  conflict: {
    icon: <AlertTriangle size={16} />,
    label: 'Conflicto',
    bg: 'bg-red-950/40',
    border: 'border-red-800/40',
    iconColor: 'text-red-400',
    labelColor: 'bg-red-900/60 text-red-300',
    btnActive: 'bg-red-900/60 text-red-300',
  },
  limit: {
    icon: <Clock size={16} />,
    label: 'Frecuencia',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/30',
    iconColor: 'text-amber-400',
    labelColor: 'bg-amber-900/60 text-amber-300',
    btnActive: 'bg-amber-900/60 text-amber-300',
  },
  time: {
    icon: <SunMoon size={16} />,
    label: 'Horario',
    bg: 'bg-blue-950/30',
    border: 'border-blue-800/30',
    iconColor: 'text-blue-400',
    labelColor: 'bg-blue-900/60 text-blue-300',
    btnActive: 'bg-blue-900/60 text-blue-300',
  },
  rest: {
    icon: <Timer size={16} />,
    label: 'Descanso',
    bg: 'bg-purple-950/30',
    border: 'border-purple-800/30',
    iconColor: 'text-purple-400',
    labelColor: 'bg-purple-900/60 text-purple-300',
    btnActive: 'bg-purple-900/60 text-purple-300',
  },
  daily: {
    icon: <CheckCircle size={16} />,
    label: 'Uso diario',
    bg: 'bg-green-950/30',
    border: 'border-green-800/30',
    iconColor: 'text-green-400',
    labelColor: 'bg-green-900/60 text-green-300',
    btnActive: 'bg-green-900/60 text-green-300',
  },
  info: {
    icon: <Repeat size={16} />,
    label: 'Información',
    bg: 'bg-zinc-800/60',
    border: 'border-zinc-700/40',
    iconColor: 'text-blue-400',
    labelColor: 'bg-zinc-700 text-zinc-300',
    btnActive: 'bg-zinc-700 text-zinc-300',
  },
}

const PERIODICITY_OPTIONS: { value: RulePeriodicityType; short: string; full: string }[] = [
  { value: 'once_week',      short: '1×/sem',    full: '1 vez por semana' },
  { value: 'twice_week',     short: '2×/sem',    full: '2 veces por semana' },
  { value: 'three_week',     short: '3×/sem',    full: '3 veces por semana' },
  { value: 'four_week',      short: '4×/sem',    full: '4 veces por semana' },
  { value: 'five_week',      short: '5×/sem',    full: '5 veces por semana' },
  { value: 'six_week',       short: '6×/sem',    full: '6 veces por semana' },
  { value: 'daily',          short: 'Diario',    full: 'Todos los días' },
  { value: 'once_two_weeks', short: 'Quincenal', full: 'Cada 2 semanas' },
  { value: 'once_month',     short: '1×/mes',    full: '1 vez al mes' },
]

// ─── Rule form (create & edit) ────────────────────────────────────────────────
interface RuleFormState {
  type: 'conflict' | 'limit' | 'time' | 'rest'
  description: string
  // conflict + rest
  productAId: string
  productBId: string
  // limit + time
  productId: string
  // limit
  periodicity: RulePeriodicityType
  // time
  allowedTime: 'morning' | 'night'
  // rest
  minDays: number
}

function inferPeriodicity(rule: CustomRule): RulePeriodicityType {
  if (rule.periodicity) return rule.periodicity
  const map: Record<number, RulePeriodicityType> = {
    1: 'once_week', 2: 'twice_week', 3: 'three_week',
    4: 'four_week', 5: 'five_week',  6: 'six_week', 7: 'daily',
  }
  return map[rule.maxPerWeek ?? 2] ?? 'twice_week'
}

const SELECT_CLS = 'w-full bg-zinc-800 text-white text-sm rounded-xl px-3 py-2.5 border border-zinc-700/60 focus:outline-none focus:border-skin-500'
const LABEL_CLS  = 'text-zinc-400 text-xs mb-1.5 block'

function RuleModal({ onClose, editRule }: { onClose: () => void; editRule?: CustomRule }) {
  const products       = useProducts()
  const addCustomRule  = useStore(s => s.addCustomRule)
  const editCustomRule = useStore(s => s.editCustomRule)
  const isEdit         = !!editRule

  const [form, setForm] = useState<RuleFormState>(() => {
    if (editRule) {
      return {
        type:        editRule.type,
        description: editRule.description,
        productAId:  editRule.productAId  ?? '',
        productBId:  editRule.productBId  ?? '',
        productId:   editRule.productId   ?? '',
        periodicity: inferPeriodicity(editRule),
        allowedTime: editRule.allowedTime ?? 'night',
        minDays:     editRule.minDays     ?? 3,
      }
    }
    return {
      type: 'conflict',
      description: '',
      productAId: '', productBId: '',
      productId: '',
      periodicity: 'twice_week',
      allowedTime: 'night',
      minDays: 3,
    }
  })

  const set = <K extends keyof RuleFormState>(k: K, v: RuleFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function pName(id: string) { return products.find(p => p.id === id)?.name ?? id }

  function handleSave() {
    const desc = form.description
    if (form.type === 'conflict') {
      if (!form.productAId || !form.productBId || form.productAId === form.productBId) return
      const data = { type: 'conflict' as const, description: desc || `${pName(form.productAId)} + ${pName(form.productBId)}`, productAId: form.productAId, productBId: form.productBId }
      isEdit ? editCustomRule(editRule!.id, data) : addCustomRule(data)
    } else if (form.type === 'limit') {
      if (!form.productId) return
      const opt = PERIODICITY_OPTIONS.find(o => o.value === form.periodicity)!
      const data = { type: 'limit' as const, description: desc || `${pName(form.productId)} — ${opt.short}`, productId: form.productId, periodicity: form.periodicity, maxPerWeek: undefined }
      isEdit ? editCustomRule(editRule!.id, data) : addCustomRule(data)
    } else if (form.type === 'time') {
      if (!form.productId) return
      const slot = form.allowedTime === 'morning' ? 'mañana' : 'noche'
      const data = { type: 'time' as const, description: desc || `${pName(form.productId)} — Solo ${slot}`, productId: form.productId, allowedTime: form.allowedTime }
      isEdit ? editCustomRule(editRule!.id, data) : addCustomRule(data)
    } else {
      if (!form.productAId || !form.productBId || form.minDays < 1) return
      const same = form.productAId === form.productBId
      const data = { type: 'rest' as const, description: desc || `Post-${pName(form.productAId)}: ${form.minDays}d antes de ${same ? 'volver a usarlo' : pName(form.productBId)}`, productAId: form.productAId, productBId: form.productBId, minDays: form.minDays }
      isEdit ? editCustomRule(editRule!.id, data) : addCustomRule(data)
    }
    onClose()
  }

  const isValid =
    form.type === 'conflict' ? (!!form.productAId && !!form.productBId && form.productAId !== form.productBId) :
    form.type === 'limit'    ? !!form.productId :
    form.type === 'time'     ? !!form.productId :
    /* rest */                 (!!form.productAId && !!form.productBId && form.minDays >= 1)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700/60 rounded-3xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">{isEdit ? 'Editar regla' : 'Nueva regla'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* ── Type selector 2×2 ── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['conflict', 'limit', 'time', 'rest'] as const).map(t => {
            const cfg = TYPE_CONFIG[t]
            return (
              <button
                key={t}
                onClick={() => set('type', t)}
                className={`py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5
                  ${form.type === t ? cfg.btnActive : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                {cfg.icon} {cfg.label}
              </button>
            )
          })}
        </div>

        {/* ── Conflict form ── */}
        {form.type === 'conflict' && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Producto A</label>
              <select value={form.productAId} onChange={e => set('productAId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>No puede combinarse con</label>
              <select value={form.productBId} onChange={e => set('productBId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {products.filter(p => p.id !== form.productAId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Limit / Frequency form ── */}
        {form.type === 'limit' && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Producto</label>
              <select value={form.productId} onChange={e => set('productId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Periodicidad</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PERIODICITY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => set('periodicity', opt.value)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-colors leading-tight
                      ${form.periodicity === opt.value ? 'bg-amber-900/70 text-amber-200 border border-amber-700/60' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent'}`}>
                    {opt.short}
                  </button>
                ))}
              </div>
              <p className="text-zinc-500 text-[10px] mt-1.5">{PERIODICITY_OPTIONS.find(o => o.value === form.periodicity)?.full}</p>
            </div>
          </div>
        )}

        {/* ── Time restriction form ── */}
        {form.type === 'time' && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Producto</label>
              <select value={form.productId} onChange={e => set('productId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Permitido solo en</label>
              <div className="flex gap-2">
                {(['morning', 'night'] as const).map(t => (
                  <button key={t} onClick={() => set('allowedTime', t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2
                      ${form.allowedTime === t ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent'}`}>
                    {t === 'morning' ? <><Sun size={14} /> Mañana</> : <><Moon size={14} /> Noche</>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Rest period form ── */}
        {form.type === 'rest' && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Después de usar</label>
              <select value={form.productAId} onChange={e => set('productAId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Días de espera: <span className="text-white font-bold">{form.minDays}</span></label>
              <input type="range" min={1} max={30} value={form.minDays}
                onChange={e => set('minDays', Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-zinc-600 text-[10px] mt-0.5">
                {[1, 5, 10, 15, 20, 25, 30].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Antes de usar</label>
              <select value={form.productBId} onChange={e => set('productBId', e.target.value)} className={SELECT_CLS}>
                <option value="">Seleccionar...</option>
                {form.productAId && <option value={form.productAId}>El mismo producto</option>}
                {products.filter(p => p.id !== form.productAId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Optional description */}
        <div className="mt-3">
          <label className={LABEL_CLS}>Descripción (opcional)</label>
          <input type="text" placeholder="Ej: Evitar irritación post-tratamiento"
            value={form.description} onChange={e => set('description', e.target.value)}
            className={`${SELECT_CLS} placeholder:text-zinc-600`} />
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!isValid}
            className="flex-1 py-3 rounded-2xl bg-skin-500 hover:bg-skin-400 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {isEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-zinc-300 text-[11px] font-medium">
      {children}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function RulesPage() {
  const allRules         = useCustomRules()
  const products         = useProducts()
  const deleteCustomRule = useStore(s => s.deleteCustomRule)
  const [showForm,    setShowForm]    = useState(false)
  const [editingRule, setEditingRule] = useState<CustomRule | undefined>(undefined)

  const builtInRules = allRules.filter(r => r.isBuiltIn)
  const userRules    = allRules.filter(r => !r.isBuiltIn)

  function getProductName(id?: string) {
    if (!id) return ''
    return products.find(p => p.id === id)?.name ?? id
  }

  function getRulePeriodicityLabel(rule: CustomRule): string {
    if (rule.periodicity) return PERIODICITY_SHORT[rule.periodicity]
    if (rule.maxPerWeek)  return `Máx ${rule.maxPerWeek}×/sem`
    return ''
  }

  function openEdit(rule: CustomRule) {
    setEditingRule(rule)
    setShowForm(true)
  }

  function RuleCard({ rule }: { rule: CustomRule }) {
    const config = TYPE_CONFIG[rule.type] ?? TYPE_CONFIG.conflict

    const chips = () => {
      if (rule.type === 'conflict') return (
        <>
          <Chip>{getProductName(rule.productAId)}</Chip>
          <span className="text-zinc-600 text-[11px] self-center">vs</span>
          <Chip>{getProductName(rule.productBId)}</Chip>
        </>
      )
      if (rule.type === 'limit') return (
        <>
          <Chip>{getProductName(rule.productId)}</Chip>
          <span className="px-2 py-0.5 bg-amber-900/40 border border-amber-800/40 rounded-lg text-amber-300 text-[11px] font-medium">
            {getRulePeriodicityLabel(rule)}
          </span>
        </>
      )
      if (rule.type === 'time') return (
        <>
          <Chip>{getProductName(rule.productId)}</Chip>
          <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-800/40 rounded-lg text-blue-300 text-[11px] font-medium flex items-center gap-1">
            {rule.allowedTime === 'morning' ? <><Sun size={10} /> Solo mañana</> : <><Moon size={10} /> Solo noche</>}
          </span>
        </>
      )
      if (rule.type === 'rest') {
        const same = rule.productAId === rule.productBId
        return (
          <>
            <Chip>{getProductName(rule.productAId)}</Chip>
            <span className="text-zinc-600 text-[11px] self-center">→ {rule.minDays}d →</span>
            <Chip>{same ? 'mismo producto' : getProductName(rule.productBId)}</Chip>
          </>
        )
      }
      return null
    }

    return (
      <div className={`p-4 rounded-2xl border ${config.bg} ${config.border}`}>
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`${config.iconColor} shrink-0`}>{config.icon}</span>
            <h3 className="text-white font-semibold text-sm truncate">{rule.description}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rule.isBuiltIn && (
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-700/60 text-zinc-400 text-[9px] font-semibold uppercase tracking-wide">
                Integrada
              </span>
            )}
            <button onClick={() => openEdit(rule)} className="text-zinc-500 hover:text-skin-400 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => deleteCustomRule(rule.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">{chips()}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-white text-xl font-bold">Reglas de compatibilidad</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Validadas automáticamente al agregar productos al calendario
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

        {/* ── Built-in rules ─────────────────────────────────────── */}
        <div>
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Reglas integradas
          </h2>
          <div className="space-y-2">
            {builtInRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
          </div>
        </div>

        {/* ── User rules ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Mis reglas
            </h2>
            <button
              onClick={() => { setEditingRule(undefined); setShowForm(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-skin-500/20 text-skin-400
                hover:bg-skin-500/30 transition-colors text-xs font-semibold"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {userRules.length === 0 ? (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 text-center">
              <p className="text-zinc-600 text-sm">Sin reglas personalizadas.</p>
              <p className="text-zinc-700 text-xs mt-1">
                Crea conflictos o límites de frecuencia para tus productos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {userRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
            </div>
          )}
        </div>

        {/* ── Informational (no validation) ──────────────────────── */}
        <div>
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Información
          </h2>
          <div className="space-y-2">
            {DAILY_INFO.map(info => (
              <div key={info.id} className={`p-4 rounded-2xl border ${TYPE_CONFIG.daily.bg} ${TYPE_CONFIG.daily.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={TYPE_CONFIG.daily.iconColor}>{TYPE_CONFIG.daily.icon}</span>
                  <h3 className="text-white font-semibold text-sm">{info.title}</h3>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showForm && (
        <RuleModal
          editRule={editingRule}
          onClose={() => { setShowForm(false); setEditingRule(undefined) }}
        />
      )}
    </div>
  )
}
