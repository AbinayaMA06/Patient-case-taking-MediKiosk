import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'kiosk'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl'

    const variants = {
      primary:
        'bg-ayush-primary text-white hover:bg-ayush-primary-dark focus-visible:ring-ayush-primary shadow-sm hover:shadow active:bg-ayush-primary-dark border border-ayush-primary-dark/20',
      secondary:
        'bg-ayush-surface text-ayush-primary hover:bg-ayush-primary-subtle border border-ayush-border focus-visible:ring-ayush-primary shadow-xs',
      accent:
        'bg-ayush-accent text-white hover:bg-ayush-accent-dark focus-visible:ring-ayush-accent shadow-sm hover:shadow',
      outline:
        'border-2 border-ayush-border bg-white text-slate-700 hover:border-ayush-primary hover:text-ayush-primary hover:bg-ayush-surface/50 focus-visible:ring-ayush-primary shadow-xs',
      ghost:
        'text-slate-700 hover:bg-ayush-surface hover:text-ayush-primary focus-visible:ring-ayush-primary',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5 font-semibold',
      kiosk:
        'text-lg px-8 py-4.5 min-h-[60px] gap-3 font-semibold rounded-2xl shadow-md hover:shadow-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
