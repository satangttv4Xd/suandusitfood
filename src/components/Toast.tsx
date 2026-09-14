import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from './Icon'
import { ToastContext, type ToastApi, type ToastTone } from './toast-context'

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

const styles: Record<ToastTone, { ring: string; icon: IconName; iconClass: string }> = {
  success: { ring: 'ring-emerald-200', icon: 'check', iconClass: 'bg-emerald-100 text-emerald-700' },
  error: { ring: 'ring-brand-200', icon: 'alert', iconClass: 'bg-brand-100 text-brand-700' },
  info: { ring: 'ring-navy-100', icon: 'info', iconClass: 'bg-navy-50 text-navy-700' },
}

/**
 * Save/delete feedback for the admin screens.
 *
 * The live region is polite rather than assertive: a "บันทึกแล้ว" should be
 * announced after whatever the user is currently reading, not on top of it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, tone, message }])
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext value={api}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-4 bottom-4 z-200 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-rise items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ${styles[toast.tone].ring}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles[toast.tone].iconClass}`}
              >
                <Icon name={styles[toast.tone].icon} className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-ink">{toast.message}</p>
              <button
                type="button"
                aria-label="ปิดข้อความ"
                onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
                className="ml-auto cursor-pointer rounded-full p-1 text-muted transition-colors duration-200 hover:bg-neutral-100 hover:text-ink"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext>
  )
}
