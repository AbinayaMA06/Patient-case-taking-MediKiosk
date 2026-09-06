import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Activity,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Zap,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useTranslation } from '@/translations'

type MeasurementStage = 'idle' | 'measuring' | 'signal_detected' | 'completed'

export function StepNadi() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session } = usePatientSession()
  const { t } = useTranslation()

  // Lifecycle state of the simulated pulse sensor
  const [stage, setStage] = useState<MeasurementStage>('completed') // Defaults to completed for quick assessment review
  const [progress, setProgress] = useState(100)
  const [pulseRate, setPulseRate] = useState(74)
  const [signalQuality, setSignalQuality] = useState<'Good' | 'Fair' | 'Weak'>('Good')
  const perfusionIndex = '4.8%'

  // Simulation timer logic
  const handleStartMeasurement = () => {
    setStage('measuring')
    setProgress(0)

    // Stage 1: Initializing contact (0 - 1.2s)
    const t1 = setTimeout(() => {
      setProgress(35)
      setStage('signal_detected')
    }, 1200)

    // Stage 2: Signal detected & calibrating (1.2 - 2.8s)
    const t2 = setTimeout(() => {
      setProgress(75)
    }, 2400)

    // Stage 3: Completed (3.6s)
    const t3 = setTimeout(() => {
      setProgress(100)
      setStage('completed')
      setPulseRate(74)
      setSignalQuality('Good')
      toast({
        title: 'Nadi Measurement Complete',
        message: 'Pulse rate locked at 74 BPM. Signal quality rated as Good.',
        type: 'success',
      })
    }, 3600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }

  // Effect to simulate incremental progress during 'measuring'
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (stage === 'measuring' || stage === 'signal_detected') {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 3 : prev))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [stage])

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="ayush">{t.nadi?.badge || 'Step 7 of 10 • Sensor Assessment'}</Badge>
            <Badge variant="saffron">Nadi Pariksha</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{t.nadi?.title || 'Nadi Assessment'}</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {t.nadi?.subtitle || 'Nadi information can provide supplementary signals for the healthcare professional.'}
          </p>
        </div>

        {session.patientName && (
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs shadow-xs self-start sm:self-auto">
            <span className="text-slate-500">Patient: </span>
            <span className="font-bold text-slate-800">{session.patientName}</span>
          </div>
        )}
      </div>

      {/* Mandatory Non-Diagnostic Clinical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-amber-950">
            {t.common?.safetyNotice || 'Important Clinical Examination Disclaimer'}
          </p>
          <p className="leading-relaxed">
            {t.common?.autonomousDisclaimer || 'Nadi/PPG information is supplementary decision support and does not replace clinical examination. The system does not claim that it can determine disease automatically. Classical Nadi Pariksha demands palpation by a qualified Ayurvedic physician (Vaidya) across superficial and deep arterial strata.'}
          </p>
        </div>
      </div>

      {/* Sensor Placement & Measurement Card */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-ayush-primary" />
              Photoplethysmographic (PPG) Pulse Sensor Interface
            </CardTitle>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Optical Sensor Active
            </span>
          </div>
          <CardDescription>
            High-precision photoplethysmography sampling at 100 Hz calibrated for radial pulse rhythm and velocity.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <Zap className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Place your finger on the sensor
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Rest your index or middle finger comfortably against the illuminated optical contact pad on the kiosk tray. Keep your hand still.
                </p>
              </div>
            </div>

            <Button
              id="btn-start-nadi-measurement"
              variant={stage === 'completed' ? 'outline' : 'primary'}
              size="lg"
              isLoading={stage === 'measuring' || stage === 'signal_detected'}
              onClick={handleStartMeasurement}
              leftIcon={stage === 'completed' ? <RefreshCw className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
              className="w-full sm:w-auto shrink-0 shadow-xs"
            >
              {stage === 'completed' ? 'Recalibrate / Retake' : 'Start Measurement'}
            </Button>
          </div>

          {/* Real-time Visual Sensor Canvas / Waveform Display */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 text-white space-y-4 relative overflow-hidden">
            {/* Top Status Indicators inside Dark Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      stage === 'measuring'
                        ? 'bg-amber-400 animate-ping'
                        : stage === 'signal_detected'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {stage === 'measuring' && 'Measuring pulse... Keep still'}
                  {stage === 'signal_detected' && 'Signal detected • Locking baseline...'}
                  {stage === 'completed' && 'Measurement complete • Stable waveform'}
                  {stage === 'idle' && 'Waiting for sensor contact'}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-slate-400">
                <span>
                  Signal quality:{' '}
                  <strong className={signalQuality === 'Good' ? 'text-emerald-400' : 'text-amber-400'}>
                    {signalQuality}
                  </strong>
                </span>
                <span>•</span>
                <span>PI: <strong className="text-slate-200">{perfusionIndex}</strong></span>
              </div>
            </div>

            {/* Main Pulse Readout & Waveform */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Pulse Rate Display */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-rose-950/70 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Heart className={`w-8 h-8 ${stage !== 'idle' ? 'animate-pulse text-rose-400' : 'text-slate-500'}`} />
                  </div>
                  {stage === 'completed' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </div>

                <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
                  Pulse Rate
                </div>
                <div className="text-5xl font-black font-mono tracking-tight text-white my-1">
                  {stage === 'measuring' ? '--' : pulseRate}
                  <span className="text-lg font-medium text-slate-400 ml-1.5">BPM</span>
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  Target resting range: 60–100 BPM
                </div>
              </div>

              {/* High-Fidelity PPG Waveform Visualization */}
              <div className="md:col-span-8 flex flex-col justify-between bg-slate-900/60 rounded-xl p-4 border border-slate-800 min-h-[170px]">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Arterial Photoplethysmogram (PPG) Waveform
                  </span>
                  <span className="text-slate-500">Sweep Speed: 25 mm/s</span>
                </div>

                {/* SVG Pulse Waveform with Systolic Peak & Dicrotic Notch */}
                <div className="w-full h-24 overflow-hidden relative">
                  <svg
                    viewBox="0 0 600 100"
                    className="w-full h-full preserve-3d"
                    preserveAspectRatio="none"
                  >
                    {/* Background grid lines */}
                    <line x1="0" y1="25" x2="600" y2="25" stroke="#1E293B" strokeWidth="0.75" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#1E293B" strokeWidth="0.75" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="#1E293B" strokeWidth="0.75" strokeDasharray="3 3" />

                    {/* PPG Arterial Pulsatile Waveform Curve */}
                    <path
                      d="
                        M 0 75
                        Q 20 75, 30 70
                        C 38 45, 45 15, 52 18
                        C 58 20, 64 50, 70 54
                        C 74 56, 78 48, 83 50
                        C 90 53, 105 73, 120 75

                        Q 140 75, 150 70
                        C 158 45, 165 15, 172 18
                        C 178 20, 184 50, 190 54
                        C 194 56, 198 48, 203 50
                        C 210 53, 225 73, 240 75

                        Q 260 75, 270 70
                        C 278 45, 285 15, 292 18
                        C 298 20, 304 50, 310 54
                        C 314 56, 318 48, 323 50
                        C 330 53, 345 73, 360 75

                        Q 380 75, 390 70
                        C 398 45, 405 15, 412 18
                        C 418 20, 424 50, 430 54
                        C 434 56, 438 48, 443 50
                        C 450 53, 465 73, 480 75

                        Q 500 75, 510 70
                        C 518 45, 525 15, 532 18
                        C 538 20, 544 50, 550 54
                        C 554 56, 558 48, 563 50
                        C 570 53, 585 73, 600 75
                      "
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className={stage === 'measuring' ? 'opacity-40 animate-pulse' : 'opacity-100'}
                    />

                    {/* Gradient fill under the curve */}
                    <path
                      d="
                        M 0 75
                        Q 20 75, 30 70
                        C 38 45, 45 15, 52 18
                        C 58 20, 64 50, 70 54
                        C 74 56, 78 48, 83 50
                        C 90 53, 105 73, 120 75
                        Q 140 75, 150 70
                        C 158 45, 165 15, 172 18
                        C 178 20, 184 50, 190 54
                        C 194 56, 198 48, 203 50
                        C 210 53, 225 73, 240 75
                        Q 260 75, 270 70
                        C 278 45, 285 15, 292 18
                        C 298 20, 304 50, 310 54
                        C 314 56, 318 48, 323 50
                        C 330 53, 345 73, 360 75
                        Q 380 75, 390 70
                        C 398 45, 405 15, 412 18
                        C 418 20, 424 50, 430 54
                        C 434 56, 438 48, 443 50
                        C 450 53, 465 73, 480 75
                        Q 500 75, 510 70
                        C 518 45, 525 15, 532 18
                        C 538 20, 544 50, 550 54
                        C 554 56, 558 48, 563 50
                        C 570 53, 585 73, 600 75
                        L 600 100 L 0 100 Z
                      "
                      fill="url(#ppgGrad)"
                      opacity="0.15"
                    />

                    <defs>
                      <linearGradient id="ppgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Sweep scan bar during measurement */}
                  {(stage === 'measuring' || stage === 'signal_detected') && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10B981]"
                      style={{ left: `${progress}%` }}
                    />
                  )}
                </div>

                {/* Anatomical feature annotation bar */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Systolic Peak: Marked</span>
                  <span>Dicrotic Notch: Present</span>
                  <span>Diastolic Wave: Normal</span>
                  <span>SNR: 98.4 dB</span>
                </div>
              </div>
            </div>

            {/* Measurement progress indicator */}
            {(stage === 'measuring' || stage === 'signal_detected') && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Acquiring optical pulse sequence</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Supplementary Classical Ayurvedic Correlation Indicators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-ayush-primary" />
                Classical Nadi Characteristics (Supplementary Signal Mapping)
              </h3>
              <span className="text-xs text-slate-500">For physician correlation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gati Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  1. Gati (Movement / Waveform)
                </span>
                <p className="font-bold text-sm text-slate-900">
                  Sarpa Gati (Vata-dominant)
                </p>
                <p className="text-xs text-slate-500">
                  Subtle, winding serpentine arterial pulse curve detected on radial tracing.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    High Confidence Signal
                  </span>
                </div>
              </div>

              {/* Vega Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  2. Vega (Velocity / Rate)
                </span>
                <p className="font-bold text-sm text-slate-900">
                  Madhyama Vega (Medium)
                </p>
                <p className="text-xs text-slate-500">
                  74 BPM conforms to balanced adult resting heart rate standards.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Normal Physiological Range
                  </span>
                </div>
              </div>

              {/* Bala Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  3. Bala (Force / Volume)
                </span>
                <p className="font-bold text-sm text-slate-900">
                  Madhyama Bala (Moderate)
                </p>
                <p className="text-xs text-slate-500">
                  Adequate arterial stroke volume without capillary bounding or collapse.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Perfusion Index 4.8%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Physician Consultation Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
            <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Supplementary Decision Support Only</span>
              <p className="mt-0.5">
                Digital Nadi sensors record superficial radial photoplethysmography.
                They cannot replicate deep three-finger manual palpation (Vata-Pitta-Kapha strata) performed by a trained Vaidya.
                All values are organized as preliminary clinical inputs for doctor review.
              </p>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/patient/jihva')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {t.common?.back || 'Previous Step'}: {t.stepper?.jihva?.title || 'Jihva'}
            </Button>

            <Button
              type="button"
              id="btn-continue-to-documents"
              variant="primary"
              size="lg"
              onClick={() => {
                toast({
                  title: 'Nadi Assessment Recorded',
                  message: 'Pulse signals captured. Advancing to Medical Documents.',
                  type: 'success',
                })
                navigate('/patient/documents')
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-sm"
            >
              {t.nadi?.continueToDocs || t.common?.continue || 'Proceed to Document Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
