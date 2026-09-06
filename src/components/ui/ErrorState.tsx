import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
  className?: string
}

export function ErrorState({
  title = 'Assessment Engine Notice',
  message = 'Unable to complete this step. Please verify your input or touch retry to continue.',
  onRetry,
  showHomeButton = true,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white border border-rose-200 shadow-xs',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-600 max-w-md mt-1.5 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retry Step
          </Button>
        )}
        {showHomeButton && (
          <Link to="/">
            <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
