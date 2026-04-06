import { AlertTriangle, Calendar, X } from 'lucide-react'
import { ValidationResult } from '../../types'
import { formatDisplay } from '../../utils/dateUtils'

interface ValidationAlertProps {
  result: ValidationResult
  onClose: () => void
  onSelectDay?: (dateStr: string) => void
}

export function ValidationAlert({ result, onClose, onSelectDay }: ValidationAlertProps) {
  if (result.valid) return null

  return (
    <div className="fixed inset-x-4 top-safe-top mt-4 z-[60] animate-slide-up"
      style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
    >
      <div className="bg-red-950/95 border border-red-800/50 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/20 rounded-full">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <span className="text-red-300 font-semibold text-sm">Conflicto detectado</span>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Errors */}
        <div className="space-y-2 mb-3">
          {result.errors.map((error, i) => (
            <p key={i} className="text-red-200 text-sm leading-relaxed">
              {error.message}
            </p>
          ))}
        </div>

        {/* Suggested days */}
        {result.suggestedDays && result.suggestedDays.length > 0 && (
          <div>
            <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
              <Calendar size={12} />
              Días disponibles:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.suggestedDays.map(day => (
                <button
                  key={day}
                  onClick={() => onSelectDay?.(day)}
                  className="px-3 py-1.5 bg-red-800/40 border border-red-700/50 rounded-lg
                    text-red-200 text-xs font-medium hover:bg-red-700/40 transition-colors"
                >
                  {formatDisplay(day, 'EEE d MMM')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
