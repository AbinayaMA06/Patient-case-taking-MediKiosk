import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  options?: { value: string; label: string }[]
  kioskSize?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      children,
      kioskSize = false,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block font-semibold text-slate-700',
              kioskSize ? 'text-base mb-1' : 'text-sm'
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full bg-white border border-slate-300 rounded-xl appearance-none transition-all duration-150',
              'text-slate-900 font-normal pr-10',
              'focus:outline-none focus:border-ayush-primary focus:ring-2 focus:ring-ayush-primary/20',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              kioskSize ? 'min-h-[58px] text-lg px-4.5' : 'min-h-[46px] text-sm px-3.5',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'
