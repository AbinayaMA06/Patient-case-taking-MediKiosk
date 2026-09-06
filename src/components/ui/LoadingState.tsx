import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface LoadingStateProps {
  message?: string
  subtext?: string
  className?: string
  variant?: 'spinner' | 'card' | 'skeleton'
}

export function LoadingState({
  message = 'Processing clinical intelligence...',
  subtext = 'Connecting to AYUSH knowledge engine & FHIR validator',
  className,
  variant = 'spinner',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('w-full space-y-4 animate-pulse p-6 bg-white rounded-2xl border border-ayush-border', className)}>
        <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-100 rounded-lg w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white border border-ayush-border shadow-xs',
        className
      )}
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-ayush-surface flex items-center justify-center text-ayush-primary border border-ayush-border">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ayush-accent text-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-3 h-3" />
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        {message}
      </h3>
      {subtext && <p className="text-xs text-slate-500 max-w-sm mt-1">{subtext}</p>}
    </div>
  )
}
