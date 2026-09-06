import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Globe,
  Maximize2,
  Minimize2,
  Users,
  Home,
  ShieldCheck,
  Stethoscope,
  Building2,
  Menu,
  X,
  LogOut,
  Ticket,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { useSystem } from '@/context/SystemContext'
import { usePatientSession } from '@/context/PatientSessionContext'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'
import { useTranslation, LANGUAGES_LIST } from '@/translations'

export function Header() {
  const location = useLocation()
  const { openEndSessionModal, isDemoMode, toggleDemoMode } = useSystem()
  const { applyConsistentDemoData } = usePatientSession()
  const { currentLang, setLanguage } = useTranslation()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'larger'>('normal')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleDemoModeToggle = () => {
    const nextState = !isDemoMode
    toggleDemoMode()
    if (nextState) {
      applyConsistentDemoData()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const cycleFontSize = () => {
    const root = document.documentElement
    if (fontSizeScale === 'normal') {
      root.style.setProperty('--app-font-scale', '1.1')
      setFontSizeScale('large')
    } else if (fontSizeScale === 'large') {
      root.style.setProperty('--app-font-scale', '1.2')
      setFontSizeScale('larger')
    } else {
      root.style.setProperty('--app-font-scale', '1')
      setFontSizeScale('normal')
    }
  }

  // Active section helper
  const isPatientArea = location.pathname.startsWith('/patient')
  const isDoctorArea = location.pathname.startsWith('/doctor')
  const isAdminArea = location.pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-ayush-border/80 shadow-2xs">
      {/* Official Government Top Ribbon */}
      <div className="bg-[#093322] text-white text-[11px] font-medium tracking-wide py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-ayush-accent/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase border border-amber-400/30">
              SIH 2026 Prototype
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-emerald-100 font-semibold">
              Ministry of AYUSH • Government of India
            </span>
            <span className="hidden md:inline text-emerald-300/80">
              (आयुष मंत्रालय, भारत सरकार)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Font scale accessibility */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-emerald-200/80 hidden sm:inline">Text Size:</span>
              <button
                type="button"
                onClick={cycleFontSize}
                className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                title="Toggle Text Size (Accessibility)"
              >
                A{fontSizeScale === 'large' ? '+' : fontSizeScale === 'larger' ? '++' : ''}
              </button>
            </div>

            {/* Language toggle demo */}
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-200" />
              <select
                value={currentLang}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-emerald-100 text-xs font-semibold focus:outline-none cursor-pointer"
                aria-label="Select Interface Language"
              >
                {LANGUAGES_LIST.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900">
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="w-11 h-11 rounded-2xl bg-ayush-surface border border-ayush-border flex items-center justify-center text-2xl shadow-2xs group-hover:border-ayush-primary/50 transition-colors">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-ayush-primary transition-colors">
                  MediKiosk
                </span>
                <span className="hidden sm:inline-block">
                  <Badge variant="ayush" size="sm">
                    AYUSH AI
                  </Badge>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-tight line-clamp-1">
                AI-Powered AYUSH Clinical History Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links & Quick Portals */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5',
                location.pathname === '/'
                  ? 'bg-ayush-surface text-ayush-primary font-bold'
                  : 'text-slate-600 hover:text-ayush-primary hover:bg-slate-50'
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              to="/patient/identify"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5',
                isPatientArea
                  ? 'bg-ayush-surface text-ayush-primary font-bold'
                  : 'text-slate-600 hover:text-ayush-primary hover:bg-slate-50'
              )}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Patient Kiosk
            </Link>

            <Link
              to="/doctor"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5',
                isDoctorArea
                  ? 'bg-ayush-surface text-ayush-primary font-bold'
                  : 'text-slate-600 hover:text-ayush-primary hover:bg-slate-50'
              )}
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              Doctor Portal
            </Link>

            <Link
              to="/admin"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5',
                isAdminArea
                  ? 'bg-ayush-surface text-ayush-primary font-bold'
                  : 'text-slate-600 hover:text-ayush-primary hover:bg-slate-50'
              )}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              Admin
            </Link>

            <Link
              to="/patient/token"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5',
                location.pathname === '/patient/token'
                  ? 'bg-ayush-surface text-ayush-primary font-bold'
                  : 'text-slate-600 hover:text-ayush-primary hover:bg-slate-50'
              )}
            >
              <Ticket className="w-4 h-4 text-emerald-600" />
              Token
            </Link>
          </nav>

          {/* Right Actions: Demo Mode, Offline Status, End Session, Login & Fullscreen Kiosk Mode */}
          <div className="flex items-center gap-2">
            {/* Prominent Demo Mode Toggle Button */}
            <button
              type="button"
              onClick={handleDemoModeToggle}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs',
                isDemoMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 animate-pulse'
                  : 'bg-white text-slate-700 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
              )}
              title="Toggle Demo Mode with consistent sample data for SIH presentation"
            >
              <Sparkles className={cn('w-3.5 h-3.5', isDemoMode ? 'text-white' : 'text-amber-500')} />
              <span>Demo Mode</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-md text-[10px] uppercase font-extrabold',
                  isDemoMode ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {isDemoMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Compact Offline Indicator */}
            <div className="hidden sm:block">
              <OfflineIndicator compact={true} showToggle={true} />
            </div>

            {/* End Session Button when in patient area */}
            {isPatientArea && (
              <Button
                variant="outline"
                size="sm"
                onClick={openEndSessionModal}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-600" />}
                className="hidden md:inline-flex text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                title="End session and purge terminal data"
              >
                End Session
              </Button>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk Fullscreen'}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-ayush-primary hover:bg-ayush-surface transition-colors hidden sm:flex items-center"
              title="Kiosk Fullscreen Mode"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <Link to="/login">
              <Button
                variant={location.pathname === '/login' ? 'primary' : 'outline'}
                size="md"
                leftIcon={<Users className="w-4 h-4" />}
                className="hidden sm:inline-flex"
              >
                Change Role
              </Button>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-slate-100 mt-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-ayush-surface"
            >
              <Home className="w-4 h-4 text-slate-500" />
              Home
            </Link>
            <Link
              to="/patient/identify"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-ayush-surface"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Patient Kiosk Intake
            </Link>
            <Link
              to="/doctor"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-ayush-surface"
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              Doctor Review Queue
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-ayush-surface"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              Admin Portal
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDemoModeToggle()
                  setIsMobileMenuOpen(false)
                }}
                className={cn(
                  'w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-between border',
                  isDemoMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Demo Mode (SIH Dataset)</span>
                </div>
                <Badge variant={isDemoMode ? 'outline' : 'saffron'}>{isDemoMode ? 'ON' : 'OFF'}</Badge>
              </button>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="lg" className="w-full">
                  Select Portal Role
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
