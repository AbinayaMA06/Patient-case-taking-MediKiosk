import { Check, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import type { PatientJourneyStep, StepItem } from '@/types'
import { useTranslation } from '@/translations'

export const PATIENT_STEPS: StepItem[] = [
  { id: 'identify', title: 'Identify', subtitle: 'ABHA / Patient', path: '/patient/identify' },
  { id: 'consent', title: 'Consent', subtitle: 'Privacy & AI', path: '/patient/consent' },
  { id: 'language', title: 'Language', subtitle: 'Dialect', path: '/patient/language' },
  { id: 'history', title: 'History', subtitle: 'Clinical Intake', path: '/patient/history' },
  { id: 'ayush', title: 'AYUSH', subtitle: 'Prakriti & Agni', path: '/patient/ayush' },
  { id: 'jihva', title: 'Jihva', subtitle: 'Tongue Exam', path: '/patient/jihva' },
  { id: 'nadi', title: 'Nadi', subtitle: 'PPG Pulse', path: '/patient/nadi' },
  { id: 'documents', title: 'Documents', subtitle: 'OCR & Records', path: '/patient/documents' },
  { id: 'summary', title: 'Review', subtitle: 'Intake Summary', path: '/patient/summary' },
  { id: 'token', title: 'Token', subtitle: 'Consult Pass', path: '/patient/token' },
]

export interface ProgressStepperProps {
  currentStepId?: PatientJourneyStep
  className?: string
  interactive?: boolean
}

export function ProgressStepper({
  currentStepId,
  className,
  interactive = true,
}: ProgressStepperProps) {
  const location = useLocation()
  const { t } = useTranslation()

  // Determine current step index from location path or passed prop
  const activeIndex = PATIENT_STEPS.findIndex((s) => {
    if (currentStepId) return s.id === currentStepId
    if (location.pathname.startsWith(s.path)) return true
    return false
  })

  const effectiveIndex = activeIndex >= 0 ? activeIndex : 0
  const activeStep = PATIENT_STEPS[effectiveIndex]
  const activeStepTitle = t.stepper?.[activeStep?.id as keyof typeof t.stepper]?.title || activeStep?.title

  return (
    <div className={cn('w-full bg-white border-y border-ayush-border/70 py-3 shadow-2xs', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile Mini Indicator */}
        <div className="flex sm:hidden items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ayush-primary text-white text-xs font-bold">
              {effectiveIndex + 1}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {activeStepTitle}
              </p>
              <p className="text-[11px] text-slate-500">
                {t.common?.stepOf ? t.common.stepOf(effectiveIndex + 1, PATIENT_STEPS.length) : `Step ${effectiveIndex + 1} of ${PATIENT_STEPS.length}`}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-ayush-primary bg-ayush-surface px-2.5 py-1 rounded-full border border-ayush-border">
            {t.common?.percentComplete ? t.common.percentComplete(Math.round(((effectiveIndex + 1) / PATIENT_STEPS.length) * 100)) : `${Math.round(((effectiveIndex + 1) / PATIENT_STEPS.length) * 100)}% Complete`}
          </div>
        </div>

        {/* Desktop / Tablet Full Stepper */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {PATIENT_STEPS.map((step, idx) => {
            const isCompleted = idx < effectiveIndex
            const isCurrent = idx === effectiveIndex
            const isUpcoming = idx > effectiveIndex

            const stepTranslation = t.stepper?.[step.id as keyof typeof t.stepper]
            const stepTitle = stepTranslation?.title || step.title
            const stepSubtitle = stepTranslation?.subtitle || step.subtitle

            const content = (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl transition-all select-none whitespace-nowrap',
                  isCurrent && 'bg-ayush-surface border border-ayush-primary/30 shadow-2xs ring-1 ring-ayush-primary/20',
                  isCompleted && 'text-slate-700 hover:bg-slate-50 cursor-pointer',
                  isUpcoming && 'text-slate-400 opacity-60 cursor-not-allowed'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={isUpcoming}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                    isCompleted && 'bg-emerald-600 text-white',
                    isCurrent && 'bg-ayush-primary text-white ring-2 ring-ayush-primary/20',
                    isUpcoming && 'bg-slate-200 text-slate-500'
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="text-left">
                  <span
                    className={cn(
                      'text-xs font-bold block leading-tight',
                      isCurrent ? 'text-ayush-primary' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    )}
                  >
                    {stepTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {stepSubtitle}
                  </span>
                </div>
              </div>
            )

            return (
              <div key={step.id} className="flex items-center shrink-0">
                {interactive && isCompleted ? (
                  <Link
                    to={step.path}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ayush-primary rounded-xl"
                    title={`Return to ${stepTitle}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
                {idx < PATIENT_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-0.5 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
