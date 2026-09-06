import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity,
  Moon,
  Utensils,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Scale,
  Brain,
  Sliders,
  Check,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useTranslation } from '@/translations'
import type { ChangeStatus, DeltaAssessmentState, AyushAssessmentState } from '@/types'

// Sample previous visit data for returning patient Ananya
const PREVIOUS_VISIT_BASELINE = {
  date: '15 August 2026',
  facility: 'National Institute of Ayurveda OPD, Jaipur',
  doctor: 'Dr. Priya Sharma, BAMS, MD (Ayur)',
  prakriti: 'Vata-Pitta',
  agni: 'Moderate',
  sleep: '6 hours',
  diet: 'Mixed',
  exercise: 'Occasional',
  currentSymptoms: 'Headache',
}

// Dashavidha Pariksha classical 10-fold parameters
const DASHAVIDHA_CATEGORIES = [
  {
    id: 'prakriti',
    title: '1. Prakriti (Baseline Constitution)',
    sanskrit: 'प्रकृति परीक्षा',
    desc: 'Genetic and biological baseline determination established at conception (Dosha dominance).',
    options: ['Vata-Pitta (Previous baseline)', 'Vata dominant', 'Pitta dominant', 'Kapha dominant', 'Tridoshic'],
    defaultVal: 'Vata-Pitta (Previous baseline)',
  },
  {
    id: 'vikriti',
    title: '2. Vikriti (Current Morbidity / Imbalance)',
    sanskrit: 'विकृति परीक्षा',
    desc: 'Current state of pathological doshic aggravation or qualitative disturbance in the tissues.',
    options: ['Vata aggravation (Stiffness/Ache)', 'Pitta aggravation (Heat/Acidity)', 'Kapha aggravation (Sluggishness)', 'Sama (Mild disturbance)', 'Under clinical review'],
    defaultVal: 'Vata aggravation (Stiffness/Ache)',
  },
  {
    id: 'sara',
    title: '3. Sara (Tissue Essence & Vitality)',
    sanskrit: 'सार परीक्षा',
    desc: 'Quality and cellular purity of seven bodily tissues (Dhatus) and mental essence (Satva).',
    options: ['Madhyama Sara (Moderate tissue vitality)', 'Pravara Sara (Superior vitality)', 'Avara Sara (Low vitality / easily fatigued)'],
    defaultVal: 'Madhyama Sara (Moderate tissue vitality)',
  },
  {
    id: 'samhanana',
    title: '4. Samhanana (Body Compactness)',
    sanskrit: 'संहनन परीक्षा',
    desc: 'Musculoskeletal firmness, bone symmetry, and structural density of body frame.',
    options: ['Madhyama (Moderate symmetry & build)', 'Susamhata (Compact & well-knit structure)', 'Hina (Lean / fragile joint build)'],
    defaultVal: 'Madhyama (Moderate symmetry & build)',
  },
  {
    id: 'pramana',
    title: '5. Pramana (Anthropometric Proportions)',
    sanskrit: 'प्रमाण परीक्षा',
    desc: 'Proportional balance between height, arm span, thoracic breadth, and limb dimensions.',
    options: ['Sama Pramana (Normal anthropometric balance)', 'Madhyama (Slight variant)', 'Asama (Disproportionate)'],
    defaultVal: 'Sama Pramana (Normal anthropometric balance)',
  },
  {
    id: 'satmya',
    title: '6. Satmya (Habituation & Adaptability)',
    sanskrit: 'सात्म्य परीक्षा',
    desc: 'Biological tolerance to climate, seasonal shifts, local waters, and dietary rasas (tastes).',
    options: ['Vyadhisatmya (Adapted to seasonal diet)', 'Pravara Satmya (All 6 tastes well-tolerated)', 'Avara Satmya (Sensitive to cold/sour)'],
    defaultVal: 'Vyadhisatmya (Adapted to seasonal diet)',
  },
  {
    id: 'satva',
    title: '7. Satva (Mental Stamina & Psychic Strength)',
    sanskrit: 'सत्व परीक्षा',
    desc: 'Psychological resilience, pain tolerance, cognitive clarity, and emotional equilibrium.',
    options: ['Madhyama Satva (Moderate mental stamina)', 'Pravara Satva (High resilience & endurance)', 'Avara Satva (Anxious / low pain threshold)'],
    defaultVal: 'Madhyama Satva (Moderate mental stamina)',
  },
  {
    id: 'ahara_shakti',
    title: '8. Ahara Shakti (Food Intake & Digestive Power)',
    sanskrit: 'आहारशक्ति परीक्षा',
    desc: 'Dual assessment of consumption capacity (Abhyavaharana) and digestion capacity (Jarana).',
    options: ['Madhyama Shakti (Moderate capacity)', 'Pravara Shakti (Strong appetite & rapid digestion)', 'Manda Shakti (Slow digestion / low appetite)'],
    defaultVal: 'Madhyama Shakti (Moderate capacity)',
  },
  {
    id: 'vyayama_shakti',
    title: '9. Vyayama Shakti (Physical Exercise Capacity)',
    sanskrit: 'व्यायामशक्ति परीक्षा',
    desc: 'Capacity for physical exertion, cardio-respiratory endurance, and labor without fatigue.',
    options: ['Madhyama (Moderate exertion tolerance)', 'Avara (Fatigues quickly with moderate stairs)', 'Pravara (High stamina & athletic tolerance)'],
    defaultVal: 'Avara (Fatigues quickly with moderate stairs)',
  },
  {
    id: 'vaya',
    title: '10. Vaya (Chronological Life Stage)',
    sanskrit: 'वय परीक्षा',
    desc: 'Current physiological epoch (Balya: childhood, Madhyama: adult/pitta stage, Vriddha: elder/vata stage).',
    options: ['Madhyama Vaya (Adult, 30–50 yrs - Pitta stage)', 'Balya Vaya (Growth phase, Kapha stage)', 'Vriddha Vaya (Senior, >60 yrs - Vata stage)'],
    defaultVal: 'Madhyama Vaya (Adult, 30–50 yrs - Pitta stage)',
  },
]

export function StepAyush() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session, setDeltaAssessment, setAyushAssessment, setReturningPatientMode } = usePatientSession()
  const { t } = useTranslation()

  // Mode toggling between Delta Mode and Full Classical AYUSH Assessment view
  const isReturning = session.isReturningPatient ?? false
  const patientDisplayName = session.patientName || (isReturning ? 'Ananya' : 'Patient')

  // Section view tabs: 'delta' (focused changes) or 'ayush' (full 6-section classical assessment)
  const [activeTab, setActiveTab] = useState<'delta' | 'ayush'>(isReturning ? 'delta' : 'ayush')

  // Delta Assessment State (Returning Patient)
  const [deltaHealth, setDeltaHealth] = useState<ChangeStatus>('Changed')
  const [deltaHealthDetail, setDeltaHealthDetail] = useState('Mild morning stiffness and recurring tension headache')

  const [deltaAppetite, setDeltaAppetite] = useState<ChangeStatus>('No change')
  const [deltaAppetiteDetail, setDeltaAppetiteDetail] = useState('Appetite remains moderate and regular')

  const [deltaSleep, setDeltaSleep] = useState<ChangeStatus>('Changed')
  const [deltaSleepDetail, setDeltaSleepDetail] = useState('Sleep reduced from 6 hours to 5 hours with occasional night waking')

  const [deltaDiet, setDeltaDiet] = useState<ChangeStatus>('Changed')
  const [deltaDietDetail, setDeltaDietDetail] = useState('Eating warmer, lighter cooked meals due to throat dryness')

  const [deltaActivity, setDeltaActivity] = useState<ChangeStatus>('No change')
  const [deltaActivityDetail, setDeltaActivityDetail] = useState('Occasional walking 3 times a week')

  // Prakriti review in Delta Mode
  const [prakritiReviewStatus, setPrakritiReviewStatus] = useState<'No change' | 'Needs reassessment'>('No change')
  const [isPrakritiReviewOpen, setIsPrakritiReviewOpen] = useState(false)

  // AYUSH Core Inputs (Req 7)
  const [selectedAgni, setSelectedAgni] = useState<'Regular' | 'Variable' | 'Low' | 'Strong' | 'Not sure'>('Variable')
  const [selectedAhara, setSelectedAhara] = useState<'Vegetarian' | 'Non-vegetarian' | 'Mixed' | 'Other'>('Mixed')
  const [selectedVihara, setSelectedVihara] = useState<'Sedentary' | 'Light activity' | 'Moderate activity' | 'Highly active'>('Light activity')
  const [selectedSleep, setSelectedSleep] = useState<'Less than 5 hours' | '5–7 hours' | '7–9 hours' | 'More than 9 hours'>('5–7 hours')
  const [selectedStress, setSelectedStress] = useState<'Low' | 'Moderate' | 'High' | 'Very high'>('Moderate')

  // Classical Section States (Req 5)
  const [selectedPrakriti, setSelectedPrakriti] = useState(
    isReturning ? 'Vata-Pitta' : 'Vata-Kapha'
  )
  const [selectedVikriti, setSelectedVikriti] = useState('Vata dominant (joint ache & stiffness)')

  // Dashavidha Pariksha State (Req 6)
  const [dashavidhaSelections, setDashavidhaSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    DASHAVIDHA_CATEGORIES.forEach((cat) => {
      init[cat.id] = cat.defaultVal
    })
    return init
  })
  const [expandedDashavidha, setExpandedDashavidha] = useState<string | null>(null)

  // Save session state and continue
  const handleContinue = () => {
    // 1. Save Delta Assessment if returning
    if (isReturning) {
      const deltaState: DeltaAssessmentState = {
        generalHealth: {
          status: deltaHealth,
          detail: deltaHealthDetail,
          previousValue: 'Headache & Joint ache',
          currentValue: deltaHealth === 'Changed' ? deltaHealthDetail : 'Stable',
        },
        appetite: {
          status: deltaAppetite,
          detail: deltaAppetiteDetail,
          previousValue: 'Moderate (Sama)',
          currentValue: deltaAppetite === 'Changed' ? deltaAppetiteDetail : 'Moderate',
        },
        sleep: {
          status: deltaSleep,
          detail: deltaSleepDetail,
          previousValue: '6 hours',
          currentValue: deltaSleep === 'Changed' ? '5 hours' : '6 hours',
        },
        diet: {
          status: deltaDiet,
          detail: deltaDietDetail,
          previousValue: 'Mixed',
          currentValue: deltaDiet === 'Changed' ? 'Warm light mixed meals' : 'Mixed',
        },
        activity: {
          status: deltaActivity,
          detail: deltaActivityDetail,
          previousValue: 'Occasional',
          currentValue: deltaActivity === 'Changed' ? deltaActivityDetail : 'Occasional',
        },
        prakritiReview: prakritiReviewStatus,
        isCompleted: true,
      }
      setDeltaAssessment(deltaState)
    }

    // 2. Save AYUSH Assessment
    const ayushState: AyushAssessmentState = {
      prakriti: selectedPrakriti,
      prakritiStatus: isReturning ? (prakritiReviewStatus === 'No change' ? 'baseline_preserved' : 'reassessed') : 'pending_validation',
      vikriti: selectedVikriti,
      agni: selectedAgni,
      ahara: selectedAhara,
      vihara: selectedVihara,
      sleep: selectedSleep,
      stress: selectedStress,
      dashavidha: dashavidhaSelections,
    }
    setAyushAssessment(ayushState)

    toast({
      title: 'AYUSH Assessment Saved',
      message: isReturning ? 'Delta changes recorded for physician review.' : 'Classical assessment recorded.',
      type: 'success',
    })

    // Navigation Requirement 9: Continue to /patient/jihva
    navigate('/patient/jihva')
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
      {/* ============================================================
          TOP HEADER & DEMO SWITCH (Allows toggling Delta vs New view)
         ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="ayush">{t.ayush?.badge || 'Step 5 of 10 • AYUSH Assessment'}</Badge>
            {isReturning ? (
              <Badge variant="saffron" className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Delta Mode Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600 bg-slate-50">
                Standard Baseline
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{t.ayush?.title || 'AYUSH Assessment'}</h2>
          <p className="text-sm text-slate-600">
            {t.ayush?.subtitle || 'Additional information to support your healthcare professional.'}
          </p>
        </div>

        {/* Quick Demo Mode Toggle so evaluator can experience both flows */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
          <button
            type="button"
            id="toggle-delta-mode-btn"
            onClick={() => {
              setReturningPatientMode(!isReturning)
              setActiveTab(!isReturning ? 'delta' : 'ayush')
            }}
            className="text-xs font-semibold text-ayush-primary hover:text-ayush-dark flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Toggle between Returning Patient (Delta Mode) and New Patient view"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isReturning ? 'Switch to New Patient View' : 'Preview Delta Mode (Returning)'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          SAFETY & TRUST DISCLAIMER (Requirement 8)
         ============================================================ */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-sm">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-950">
            {t.common?.safetyNotice || 'Clinical Organization & Safety Notice'}
          </strong>
          <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
            {t.common?.autonomousDisclaimer || 'AI does not make an autonomous diagnosis. Final clinical decisions remain with the qualified healthcare professional.'}
          </p>
        </div>
      </div>

      {/* ============================================================
          TAB NAVIGATION (Delta Mode vs Complete Classical AYUSH)
         ============================================================ */}
      {isReturning && (
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('delta')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${
              activeTab === 'delta'
                ? 'text-ayush-primary border-b-2 border-ayush-primary'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. {t.ayush?.deltaTitle || 'Returning Patient Delta Mode'}
            <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Changes Only
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ayush')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative ${
              activeTab === 'ayush'
                ? 'text-ayush-primary border-b-2 border-ayush-primary'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. {t.ayush?.prakritiTitle || 'Classical AYUSH & Dashavidha Pariksha'}
            <span className="ml-1.5 text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">
              Full Framework
            </span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION A: RETURNING PATIENT DELTA MODE (Requirements 1, 2, 3, 4)
         ========================================================================= */}
      {(activeTab === 'delta' || isReturning) && (
        <div className={`space-y-6 ${activeTab !== 'delta' && isReturning ? 'hidden' : 'block'}`}>
          {/* 1. Welcome Back Card (Requirement 1) */}
          <Card variant="default" className="border-ayush-border/80 bg-gradient-to-br from-white to-ayush-surface/30">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="ayush" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  Returning Patient Verification
                </Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Previous visit: {PREVIOUS_VISIT_BASELINE.date}
                </span>
              </div>
              <CardTitle className="text-2xl mt-2 text-slate-900 font-extrabold">
                Welcome back, {patientDisplayName}
              </CardTitle>
              <CardDescription className="text-base text-slate-700 font-medium mt-1">
                We already have information from your previous visit.
              </CardDescription>
              <p className="text-xs text-slate-600 pt-0.5">
                We&apos;ll focus on what&apos;s changed since your last assessment.
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Previous History Comparison Card (Requirement 1) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Previous Assessment Baseline (15 August 2026)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: ABHA-9182-4410
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Prakriti</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.prakriti}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Agni</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.agni}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Sleep</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.sleep}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Diet</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.diet}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Exercise</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.exercise}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Current symptoms</span>
                    <strong className="text-sm font-bold text-slate-900">{PREVIOUS_VISIT_BASELINE.currentSymptoms}</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Prakriti Baseline Review in Delta Mode (Requirement 3) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Constitutional Baseline (Prakriti)
                </span>
                <Badge variant={prakritiReviewStatus === 'No change' ? 'ayush' : 'saffron'}>
                  {prakritiReviewStatus}
                </Badge>
              </div>
              <CardTitle className="text-lg text-slate-900 font-bold mt-1">
                Prakriti information is already available from your previous assessment.
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Classical Ayurvedic Prakriti represents your innate constitution established at birth. By default, it is preserved across subsequent visits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                    VP
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Recorded Prakriti: Vata-Pitta</h5>
                    <p className="text-xs text-slate-600">Dual constitutional baseline recorded on 15 Aug 2026</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPrakritiReviewOpen(!isPrakritiReviewOpen)}
                  className="bg-white hover:bg-slate-50 text-xs"
                >
                  Review Prakriti
                  {isPrakritiReviewOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>

              {/* Review Prakriti Accordion Content */}
              {isPrakritiReviewOpen && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-700">
                    If your physician or you observe substantial changes in innate tendencies (e.g. digestive capacity, cold intolerance), you can request a reassessment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPrakritiReviewStatus('No change')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        prakritiReviewStatus === 'No change'
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      No change
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrakritiReviewStatus('Needs reassessment')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        prakritiReviewStatus === 'Needs reassessment'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Needs reassessment
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Delta Questions (Requirement 2) */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ayush-primary" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Delta Questions (Changes Since 15 Aug 2026)
                </span>
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Tell us what has changed
              </CardTitle>
              <CardDescription>
                We ask only whether your health status or lifestyle parameters have changed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question 1: General Health */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    1. Has your general health changed since your last visit?
                  </h4>
                  <span className="text-xs text-slate-500">Baseline: Headache</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['No change', 'Changed', 'Not sure'] as ChangeStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeltaHealth(opt)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        deltaHealth === opt
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {deltaHealth === 'Changed' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Describe any new symptoms or changes:
                    </label>
                    <input
                      type="text"
                      value={deltaHealthDetail}
                      onChange={(e) => setDeltaHealthDetail(e.target.value)}
                      placeholder="e.g. New headache episodes in evenings, joint stiffness"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-ayush-primary/30"
                    />
                  </div>
                )}
              </div>

              {/* Question 2: Appetite */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    2. Has your appetite changed?
                  </h4>
                  <span className="text-xs text-slate-500">Baseline: Moderate</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['No change', 'Changed', 'Not sure'] as ChangeStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeltaAppetite(opt)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        deltaAppetite === opt
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {deltaAppetite === 'Changed' && (
                  <div className="pt-2 animate-in fade-in duration-150 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      How would you describe your current appetite?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Lower than before', 'Sharper / Increased hunger', 'Variable / Irregular', 'Loss of taste (Aruchi)'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setDeltaAppetiteDetail(app)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            deltaAppetiteDetail === app
                              ? 'bg-emerald-50 border-ayush-primary text-ayush-primary font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Question 3: Sleep pattern */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    3. Has your sleep pattern changed?
                  </h4>
                  <span className="text-xs text-slate-500">Baseline: 6 hours</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['No change', 'Changed', 'Not sure'] as ChangeStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeltaSleep(opt)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        deltaSleep === opt
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {deltaSleep === 'Changed' && (
                  <div className="pt-2 animate-in fade-in duration-150 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      How many hours do you currently sleep?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Less than 5 hours', '5 hours', '7–8 hours', 'Broken / Disturbed sleep'].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDeltaSleepDetail(hrs)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            deltaSleepDetail === hrs
                              ? 'bg-emerald-50 border-ayush-primary text-ayush-primary font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {hrs}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Question 4: Diet */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    4. Has your diet changed?
                  </h4>
                  <span className="text-xs text-slate-500">Baseline: Mixed</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['No change', 'Changed', 'Not sure'] as ChangeStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeltaDiet(opt)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        deltaDiet === opt
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {deltaDiet === 'Changed' && (
                  <div className="pt-2 animate-in fade-in duration-150 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      What has changed in your diet?
                    </label>
                    <input
                      type="text"
                      value={deltaDietDetail}
                      onChange={(e) => setDeltaDietDetail(e.target.value)}
                      placeholder="e.g. Switched to warmer lighter meals, reduced dairy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-ayush-primary/30"
                    />
                  </div>
                )}
              </div>

              {/* Question 5: Activity level */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    5. Has your activity level changed?
                  </h4>
                  <span className="text-xs text-slate-500">Baseline: Occasional</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['No change', 'Changed', 'Not sure'] as ChangeStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeltaActivity(opt)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        deltaActivity === opt
                          ? 'bg-ayush-primary text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {deltaActivity === 'Changed' && (
                  <div className="pt-2 animate-in fade-in duration-150 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      How has your activity or exercise changed?
                    </label>
                    <input
                      type="text"
                      value={deltaActivityDetail}
                      onChange={(e) => setDeltaActivityDetail(e.target.value)}
                      placeholder="e.g. Reduced walking due to morning stiffness"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-ayush-primary/30"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. Delta Summary Card (Requirement 4) */}
          <Card variant="default" className="border-emerald-200 bg-emerald-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg text-slate-900 font-bold">
                  Changes since last visit
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-600">
                Summary of delta updates prepared for the doctor&apos;s EHR chart.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Sleep</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    {deltaSleep === 'Changed' ? (
                      <>
                        <span className="line-through text-slate-400">6 hours</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-800">{deltaSleepDetail || '5 hours'}</span>
                      </>
                    ) : (
                      <span>No change (6 hours)</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Appetite</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    {deltaAppetite === 'Changed' ? (
                      <span className="text-amber-700">{deltaAppetiteDetail || 'Changed'}</span>
                    ) : (
                      <span className="text-slate-700">No change</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Diet</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    {deltaDiet === 'Changed' ? (
                      <span className="text-emerald-800">{deltaDietDetail || 'Changed'}</span>
                    ) : (
                      <span className="text-slate-700">No change</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Symptoms</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    {deltaHealth === 'Changed' ? (
                      <span className="text-amber-800 font-bold">{deltaHealthDetail || 'New headache'}</span>
                    ) : (
                      <span className="text-slate-700">No new symptoms</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement 4 Mandate */}
              <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Only changed information will be included in the updated clinical history.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SECTION B: AYUSH ASSESSMENT (Requirements 5, 6, 7)
         ========================================================================= */}
      {(activeTab === 'ayush' || !isReturning) && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Prakriti (Requirement 3 & 5) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 1 of 6</Badge>
                  <Badge variant="outline">Constitution</Badge>
                </div>
                <span className="text-xs text-slate-500">Classical Assessment</span>
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                {isReturning ? 'Prakriti Baseline Verification' : 'Prakriti assessment'}
              </CardTitle>
              <CardDescription>
                {isReturning
                  ? 'Prakriti information is already available from your previous assessment.'
                  : 'Validated Prakriti assessment will be performed here.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isReturning ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <InfoIcon className="w-4 h-4 text-amber-600" />
                    <span>Validated Prakriti assessment will be performed here.</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    MediKiosk does not claim to calculate a definitive medical Prakriti diagnosis automatically. The selections below record observed tendencies for physician validation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {[
                      { name: 'Vata Predominant', desc: 'Tendency toward lightness, dry skin, sensitive joints', val: 'Vata' },
                      { name: 'Pitta Predominant', desc: 'Tendency toward body heat, quick digestion, sharpness', val: 'Pitta' },
                      { name: 'Kapha Predominant', desc: 'Tendency toward heaviness, stable endurance, calm demeanor', val: 'Kapha' },
                      { name: 'Vata-Pitta Mixed', desc: 'Dual constitutional tendencies (most common)', val: 'Vata-Pitta' },
                      { name: 'Pitta-Kapha Mixed', desc: 'Dual metabolic and structural strength', val: 'Pitta-Kapha' },
                      { name: 'Vata-Kapha Mixed', desc: 'Variable digestion with joint cold sensitivity', val: 'Vata-Kapha' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSelectedPrakriti(item.val)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPrakriti === item.val
                            ? 'bg-ayush-surface border-ayush-primary ring-2 ring-ayush-primary/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Recorded Baseline</span>
                    <h4 className="text-base font-bold text-slate-900">Vata-Pitta (Dual Doshic Constitution)</h4>
                    <p className="text-xs text-slate-600">Established on 15 August 2026. Review Status: {prakritiReviewStatus}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPrakritiReviewStatus(prakritiReviewStatus === 'No change' ? 'Needs reassessment' : 'No change')
                    }}
                  >
                    {prakritiReviewStatus === 'No change' ? 'Request Reassessment' : 'Mark No Change'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Vikriti (Requirement 5) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 2 of 6</Badge>
                  <Badge variant="outline">Clinical Imbalance</Badge>
                </div>
                <span className="text-xs text-slate-500">Current Doshic State</span>
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Vikriti (Current Imbalance)
              </CardTitle>
              <CardDescription>
                Identifies which doshic energies are currently perturbed relative to your constitutional baseline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Vata Imbalance',
                    desc: 'Dryness, joint stiffness, localized pain, restlessness, or disturbed sleep',
                    val: 'Vata dominant (joint ache & stiffness)',
                  },
                  {
                    title: 'Pitta Imbalance',
                    desc: 'Acid reflux, skin flare-ups, heat sensations, burning eyes, or irritability',
                    val: 'Pitta dominant (heat & acidity)',
                  },
                  {
                    title: 'Kapha Imbalance',
                    desc: 'Heaviness in chest or head, sluggish digestion, morning lethargy, mucus',
                    val: 'Kapha dominant (sluggishness & heaviness)',
                  },
                  {
                    title: 'Tridoshic / Mixed',
                    desc: 'Complex presentation involving two or more active doshas simultaneously',
                    val: 'Mixed Doshic Involvement',
                  },
                ].map((vik) => (
                  <button
                    key={vik.val}
                    type="button"
                    onClick={() => setSelectedVikriti(vik.val)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedVikriti === vik.val
                        ? 'bg-ayush-surface border-ayush-primary ring-2 ring-ayush-primary/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-slate-900">{vik.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{vik.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Agni (Requirements 5 & 7) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 3 of 6</Badge>
                  <Badge variant="outline">Digestive Fire</Badge>
                </div>
                <span className="text-xs text-slate-500">Agni Pariksha</span>
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Agni (Digestive Capacity)
              </CardTitle>
              <CardDescription>
                Classical assessment of digestive fire, which governs metabolism, immunity, and Ama formation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(['Regular', 'Variable', 'Low', 'Strong', 'Not sure'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedAgni(opt)}
                    className={`min-h-[50px] p-3 rounded-2xl border text-center transition-all ${
                      selectedAgni === opt
                        ? 'bg-ayush-primary text-white font-bold border-ayush-primary shadow-xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm block">{opt}</span>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      {opt === 'Regular' && 'Sama Agni'}
                      {opt === 'Variable' && 'Vishama (Vata)'}
                      {opt === 'Low' && 'Manda (Kapha)'}
                      {opt === 'Strong' && 'Tikshna (Pitta)'}
                      {opt === 'Not sure' && 'For review'}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Ahara (Diet) (Requirements 5 & 7) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 4 of 6</Badge>
                  <Badge variant="outline">Dietary Habits</Badge>
                </div>
                <Utensils className="w-4 h-4 text-slate-400" />
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Ahara (Diet & Nutritional Habits)
              </CardTitle>
              <CardDescription>
                Dietary composition and intake patterns that modulate doshic equilibrium.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Vegetarian', 'Non-vegetarian', 'Mixed', 'Other'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedAhara(opt)}
                    className={`min-h-[48px] p-3 rounded-2xl border text-center transition-all ${
                      selectedAhara === opt
                        ? 'bg-ayush-primary text-white font-bold border-ayush-primary shadow-xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm block font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Vihara, Sleep & Stress (Requirements 5 & 7) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 5 of 6</Badge>
                  <Badge variant="outline">Lifestyle & Regimen</Badge>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Vihara (Physical Regimen, Sleep & Stress)
              </CardTitle>
              <CardDescription>
                Physical activity, resting rhythms (Nidra), and psychic stress burden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 1. Activity (Vihara) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Activity Level (Vihara)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Sedentary', 'Light activity', 'Moderate activity', 'Highly active'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedVihara(opt)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedVihara === opt
                          ? 'bg-ayush-primary text-white border-ayush-primary shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sleep */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  Sleep Duration (Nidra)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Less than 5 hours', '5–7 hours', '7–9 hours', 'More than 9 hours'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedSleep(opt)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSleep === opt
                          ? 'bg-ayush-primary text-white border-ayush-primary shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Stress */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-rose-600" />
                  Stress Level (Manasika Bhava)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Low', 'Moderate', 'High', 'Very high'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedStress(opt)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedStress === opt
                          ? 'bg-ayush-primary text-white border-ayush-primary shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Dashavidha Pariksha (Requirements 5 & 6) */}
          <Card variant="default">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="ayush">Section 6 of 6</Badge>
                  <Badge variant="saffron">Classical Tenfold Examination</Badge>
                </div>
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
              <CardTitle className="text-xl text-slate-900 font-bold mt-1">
                Dashavidha Pariksha (दशविध परीक्षा)
              </CardTitle>
              <CardDescription>
                Classical 10-fold clinical framework from Charaka Samhita. Educational structured overview for doctor review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-ayush-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Educational Clinical Template:</strong> To be reviewed by healthcare professional. MediKiosk does not draw autonomous clinical conclusions.
                </span>
              </div>

              {/* Accordion List for the 10 Categories */}
              <div className="space-y-2.5 pt-2">
                {DASHAVIDHA_CATEGORIES.map((category) => {
                  const isExpanded = expandedDashavidha === category.id
                  const selectedVal = dashavidhaSelections[category.id] || category.defaultVal

                  return (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedDashavidha(isExpanded ? null : category.id)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{category.title}</h4>
                            <span className="text-[11px] text-ayush-primary font-medium">{category.sanskrit}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{category.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block bg-slate-100 px-2.5 py-1 rounded-lg">
                            {selectedVal}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 bg-slate-50/50 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                          <p className="text-xs text-slate-600 leading-relaxed">{category.desc}</p>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                              Select Clinical Observation (To be reviewed by healthcare professional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {category.options.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setDashavidhaSelections((prev) => ({
                                      ...prev,
                                      [category.id]: opt,
                                    }))
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                    selectedVal === opt
                                      ? 'bg-ayush-primary text-white font-bold border-ayush-primary shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================
          BOTTOM NAVIGATION & PERSISTENCE (Requirement 9)
         ============================================================ */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/patient/history')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {t.common?.back || 'Previous Step'}: {t.stepper?.history?.title || 'History'}
        </Button>

        <Button
          type="button"
          id="continue-to-jihva-btn"
          variant="accent"
          size="lg"
          onClick={handleContinue}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shadow-sm"
        >
          {t.ayush?.continueToJihva || t.common?.continue || 'Continue'}
        </Button>
      </div>
    </div>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return <AlertCircle className={className} />
}
