import { Wifi, WifiOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useSystem } from '@/context/SystemContext'
import { useToast } from '@/hooks/useToast'

interface OfflineIndicatorProps {
  compact?: boolean
  showToggle?: boolean
}

export function OfflineIndicator({ compact = false, showToggle = true }: OfflineIndicatorProps) {
  const { offlineStatus, isOffline, pendingSyncCount, toggleOfflineMode, triggerManualSync } =
    useSystem()
  const { toast } = useToast()

  const handleToggle = () => {
    toggleOfflineMode()
    if (!isOffline) {
      toast({
        title: 'Offline Mode Activated',
        message: 'Information is stored temporarily on this device and will sync when connectivity returns.',
        type: 'warning',
      })
    } else {
      toast({
        title: 'Network Reconnected',
        message: 'Synchronizing local queue and encrypted assessment records...',
        type: 'info',
      })
    }
  }

  const handleSync = () => {
    if (isOffline) {
      toast({
        title: 'Cannot Sync While Offline',
        message: 'Disable simulated offline mode first to allow synchronization.',
        type: 'error',
      })
      return
    }
    triggerManualSync()
    toast({
      title: 'Manual Sync Dispatched',
      message: 'Local kiosk intake records synced with OPD Hospital server.',
      type: 'success',
    })
  }

  const getStatusBadge = () => {
    switch (offlineStatus) {
      case 'Offline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Offline</span>
          </span>
        )
      case 'Sync pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <RefreshCw className="w-3.5 h-3.5 text-sky-700 animate-spin" />
            <span>Sync Pending ({pendingSyncCount})</span>
          </span>
        )
      case 'Synced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Synced</span>
          </span>
        )
      case 'Online':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Online</span>
          </span>
        )
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {showToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="text-[11px] font-bold text-slate-500 hover:text-ayush-primary underline cursor-pointer"
            title="Toggle simulated offline mode for testing"
          >
            {isOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Connectivity Status</span>
            <span className="text-slate-500">
              {isOffline
                ? 'Local cache active • Changes held locally'
                : 'ABDM Health Gateway & Hospital LAN Connected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showToggle && (
            <button
              type="button"
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {isOffline ? 'Restore Online' : 'Simulate Offline Mode'}
            </button>
          )}

          {!isOffline && (
            <button
              type="button"
              onClick={handleSync}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Trigger manual cloud sync"
              aria-label="Sync"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Required Offline Alert Banner */}
      {isOffline && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-amber-900">Offline mode active</p>
            <p className="text-amber-800 leading-relaxed">
              Information is stored temporarily on this device and will sync when connectivity
              returns.
            </p>
            <div className="text-[11px] text-amber-700/80 font-mono pt-1">
              Local queue storage: {pendingSyncCount} items cached in memory • No data loss
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
