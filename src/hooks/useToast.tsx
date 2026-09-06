import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ToastMessage, ToastType } from '@/types'

interface ToastContextValue {
  toasts: ToastMessage[]
  toast: (options: { message: string; title?: string; type?: ToastType; duration?: number }) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({
      message,
      title,
      type = 'info',
      duration = 4000,
    }: {
      message: string
      title?: string
      type?: ToastType
      duration?: number
    }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastMessage = { id, message, title, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
