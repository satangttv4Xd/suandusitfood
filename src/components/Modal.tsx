import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useOnEscape, useScrollLock } from '../lib/hooks'
import { Icon } from './Icon'
import { Button } from './ui'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  useScrollLock(open)
  useOnEscape(onClose, open)

  // Move focus into the dialog so keyboard and screen-reader users land here.
  useEffect(() => {
    if (!open) return
    const target = panel.current?.querySelector<HTMLElement>(
      '[data-autofocus], button, input, select, textarea, a[href]',
    )
    target?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade bg-navy-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full animate-rise ${widths[size]} max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl scroll-thin`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-body">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="-mt-1 -mr-1 cursor-pointer rounded-full p-2 text-muted transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** The one gate in front of every destructive admin action. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ลบถาวร',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name="alert" className="h-5 w-5" />
        </span>
        <div className="text-body">{message}</div>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" icon="trash" onClick={onConfirm} data-autofocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
