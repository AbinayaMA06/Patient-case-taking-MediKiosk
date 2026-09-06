import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  kioskSize?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      kioskSize = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
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
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-white border border-slate-300 rounded-xl transition-all duration-150',
              'text-slate-900 placeholder:text-slate-400 font-normal',
              'focus:outline-none focus:border-ayush-primary focus:ring-2 focus:ring-ayush-primary/20',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              kioskSize
                ? 'min-h-[58px] text-lg px-4.5 rounded-2xl'
                : 'min-h-[46px] text-sm px-3.5',
              leftIcon && (kioskSize ? 'pl-12' : 'pl-10'),
              (rightIcon || error) && (kioskSize ? 'pr-12' : 'pr-10'),
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20',
              className
            )}
            {...props}
          />
          {error ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center text-slate-400">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
