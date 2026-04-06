import { AlertTriangle, CheckCircle, Clock, Repeat } from 'lucide-react'

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

export function RulesPage() {
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
      </div>
    </div>
  )
}
