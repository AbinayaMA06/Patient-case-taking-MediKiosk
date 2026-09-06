import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'ayush' | 'saffron' | 'warning' | 'danger' | 'neutral' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  icon,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'bg-slate-100 text-slate-700 border-slate-200',
    ayush:
      'bg-ayush-surface text-ayush-primary border-ayush-border font-semibold',
    saffron:
      'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    warning:
      'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger:
      'bg-red-50 text-red-700 border-red-200 font-semibold',
    neutral:
      'bg-gray-100 text-gray-800 border-gray-200',
    outline:
      'bg-transparent border-slate-300 text-slate-700',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
