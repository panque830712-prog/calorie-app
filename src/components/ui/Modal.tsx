import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#e8e0d4] flex-shrink-0">
            <h2 className="text-lg font-semibold text-[#2d2d2d]">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f0e8] touch-manipulation">
              <X size={20} className="text-[#8a8a8a]" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 scrollable">
          {children}
        </div>
        <div className="pb-safe h-safe flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  )
}
