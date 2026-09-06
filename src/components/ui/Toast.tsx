import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-ayush-primary shrink-0" />,
  }

  const borderStyles = {
    success: 'border-emerald-200 bg-white text-slate-800 shadow-emerald-50/50',
    error: 'border-rose-200 bg-white text-slate-800 shadow-rose-50/50',
    warning: 'border-amber-200 bg-white text-slate-800 shadow-amber-50/50',
    info: 'border-ayush-border bg-white text-slate-800 shadow-ayush-primary/5',
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start gap-3 transition-all',
            'animate-in slide-in-from-bottom-5 duration-200',
            borderStyles[t.type]
          )}
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0 pr-1">
            {t.title && (
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {t.title}
              </h4>
            )}
            <p className="text-sm text-slate-600 leading-snug">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
