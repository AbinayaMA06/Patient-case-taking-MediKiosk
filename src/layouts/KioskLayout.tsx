import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home, HelpCircle, Volume2, Eye, Type, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ProgressStepper } from '@/components/ui/ProgressStepper'
import { Button } from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useSystem } from '@/context/SystemContext'

export function KioskLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { isDemoMode, toggleDemoMode } = useSystem()
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'larger'>('normal')
  const [isHighContrast, setIsHighContrast] = useState(false)

  const handleVoiceGuidance = () => {
    toast({
      title: 'Voice Guidance Active',
      message: 'Simulated voice guidance enabled. Prompt audio is active for current step.',
      type: 'info',
    })
  }

  const handleToggleLargerText = () => {
    const root = document.documentElement
    if (fontSizeScale === 'normal') {
      root.style.setProperty('--app-font-scale', '1.15')
      setFontSizeScale('large')
      toast({
        title: 'Larger Text Activated',
        message: 'Font size increased to 115% for enhanced terminal readability.',
        type: 'info',
      })
    } else if (fontSizeScale === 'large') {
      root.style.setProperty('--app-font-scale', '1.25')
      setFontSizeScale('larger')
      toast({
        title: 'Extra Large Text Activated',
        message: 'Font size increased to 125% for maximum visibility.',
        type: 'info',
      })
    } else {
      root.style.setProperty('--app-font-scale', '1')
      setFontSizeScale('normal')
      toast({
        title: 'Standard Text Restored',
        message: 'Font scale returned to normal (100%).',
        type: 'info',
      })
    }
  }

  const handleToggleHighContrast = () => {
    const nextState = !isHighContrast
    setIsHighContrast(nextState)
    if (nextState) {
      document.documentElement.classList.add('high-contrast')
      toast({
        title: 'High Contrast Mode ON',
        message: 'High contrast theme activated for low-vision readability.',
        type: 'info',
      })
    } else {
      document.documentElement.classList.remove('high-contrast')
      toast({
        title: 'Standard Theme Restored',
        message: 'High contrast mode turned off.',
        type: 'info',
      })
    }
  }

  const handleHelp = () => {
    toast({
      title: 'Kiosk Attendant Alerted',
      message: 'A hospital intake assistant has been notified to assist you at this terminal.',
      type: 'warning',
    })
  }

  const isTokenPage = location.pathname.includes('/token')

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-slate-800 antialiased select-none">
      <Header />

      {/* Demo Mode Notification Ribbon */}
      {isDemoMode && (
        <aside aria-label="Demo mode status" className="bg-amber-50 border-b border-amber-300/80 py-2 px-4 text-xs font-semibold text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> SIH Presentation Dataset prefilled (Ananya Krishnan, 42 F, ABHA: XX-XXXX-XXXX-4821 • Delta: Sleep 6h → 5h, New concern: Headache).
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleDemoMode()}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
            >
              Exit Demo Mode
            </button>
          </div>
        </aside>
      )}

      {/* Patient Stepper Bar */}
      {!isTokenPage && <ProgressStepper interactive={true} />}

      {/* Kiosk Floating Action Banner / Accessible Controls */}
      <div className="bg-white border-b border-ayush-border py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              leftIcon={<Home className="w-4 h-4" />}
              className="hidden sm:inline-flex"
            >
              Cancel Intake
            </Button>
          </div>

          {/* Accessibility Controls Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Accessibility:</span>
              <button
                type="button"
                onClick={handleToggleLargerText}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white text-slate-700 hover:text-ayush-primary transition-colors flex items-center gap-1 border border-transparent hover:border-slate-200"
                title="Increase on-screen text size"
              >
                <Type className="w-3.5 h-3.5 text-ayush-primary" />
                <span>Larger Text {fontSizeScale !== 'normal' && `(${fontSizeScale === 'large' ? '+15%' : '+25%'})`}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 border ${
                  isHighContrast
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'hover:bg-white text-slate-700 hover:text-ayush-primary border-transparent hover:border-slate-200'
                }`}
                title="Toggle high contrast colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>High Contrast</span>
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleVoiceGuidance}
              leftIcon={<Volume2 className="w-4 h-4 text-ayush-primary" />}
            >
              <span className="hidden sm:inline">Voice Guidance</span>
              <span className="sm:hidden">Voice</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleHelp}
              leftIcon={<HelpCircle className="w-4 h-4 text-amber-600" />}
            >
              Need Help?
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <Outlet />
      </main>

      {/* Accessible Kiosk Footer Info */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Terminal ID: <strong>AYUSH-KIOSK-04</strong> • AI Engine v2.4</span>
          <span>In case of emergency, please approach the triage nurse directly.</span>
        </div>
      </footer>

      <ToastContainer />
    </div>
  )
}
