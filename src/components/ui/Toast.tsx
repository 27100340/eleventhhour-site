'use client'

// App-wide toast notifications. Replaces the old alert() feedback.
// Usage: const toast = useToast(); toast.success('Booking saved')
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cx } from '@/lib/cx'

type ToastTone = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  tone: ToastTone
  message: string
}

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const toneStyles: Record<ToastTone, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-accent' },
  error: { icon: AlertCircle, classes: 'text-red-700' },
  info: { icon: Info, classes: 'text-ink-soft' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-3), { id, tone, message }])
      const timeout = tone === 'error' ? 7000 : 4000
      setTimeout(() => dismiss(id), timeout)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map(({ id, tone, message }) => {
          const { icon: Icon, classes } = toneStyles[tone]
          return (
            <div
              key={id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-(--radius-card) border border-line bg-surface p-4 shadow-soft animate-[toast-in_0.2s_ease-out]"
            >
              <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', classes)} />
              <p className="flex-1 text-sm text-ink">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="shrink-0 rounded p-0.5 text-ink-faint transition-colors hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
