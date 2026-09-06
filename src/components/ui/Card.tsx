import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'surface' | 'accent' | 'highlight'
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      'bg-white border border-ayush-border/80 shadow-xs rounded-2xl',
    interactive:
      'bg-white border-2 border-ayush-border/80 shadow-xs hover:shadow-md hover:border-ayush-primary/60 transition-all duration-200 cursor-pointer active:scale-[0.99] rounded-2xl',
    surface:
      'bg-ayush-surface/70 border border-ayush-border rounded-2xl shadow-none',
    accent:
      'bg-white border-t-4 border-t-ayush-accent border-ayush-border shadow-sm rounded-2xl',
    highlight:
      'bg-gradient-to-b from-ayush-surface to-white border border-ayush-border shadow-sm rounded-2xl',
  }

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pb-3 space-y-1.5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-xl font-bold tracking-tight text-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-500 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
