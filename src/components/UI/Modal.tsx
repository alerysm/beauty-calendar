import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Sheet */}
      <div
        className={`relative w-full sm:max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl
          shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
