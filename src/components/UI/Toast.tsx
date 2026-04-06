import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 inset-x-0 z-[70] flex flex-col gap-2 p-4 pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
              shadow-xl backdrop-blur-sm animate-slide-up
              ${toast.type === 'success' ? 'bg-green-900/95 border border-green-700/50' :
                toast.type === 'error'   ? 'bg-red-900/95 border border-red-700/50' :
                                           'bg-zinc-800/95 border border-zinc-700/50'}`}
          >
            {toast.type === 'success' && <CheckCircle size={18} className="text-green-400 shrink-0" />}
            {toast.type === 'error'   && <AlertCircle size={18} className="text-red-400 shrink-0" />}
            {toast.type === 'info'    && <Info         size={18} className="text-blue-400 shrink-0" />}
            <p className={`text-sm flex-1 font-medium
              ${toast.type === 'success' ? 'text-green-100' :
                toast.type === 'error'   ? 'text-red-100' :
                                           'text-zinc-100'}`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => remove(toast.id)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
