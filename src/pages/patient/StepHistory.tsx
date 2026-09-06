import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mic,
  Square,
  RotateCcw,
  Check,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  Edit3,
  User,
  Users,
  Languages,
  Bell,
  HeartPulse,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import type { StructuredClinicalHistory } from '@/types'
import { useTranslation } from '@/translations'
import type { TranslationSchema } from '@/translations/types'

// SOCRATES question step definition
interface QuestionDef {
  id: string
  fieldKey: keyof StructuredClinicalHistory
  label: string
  getQuestion: (answers: Record<string, string>) => string
  quickAnswers: (answers: Record<string, string>) => string[]
  getVoiceSimulation: (answers: Record<string, string>) => string
  isConditional?: (answers: Record<string, string>) => boolean
  redFlagCheck?: (answer: string, answers: Record<string, string>) => string | null
}

const RED_FLAG_KEYWORDS = [
  'severe chest pain',
  'difficulty breathing',
  'shortness of breath',
  'loss of consciousness',
  'severe bleeding',
  'sudden weakness',
  'very severe sudden headache',
  'chest pain',
  'fainting',
  'सीने में तेज दर्द',
  'सांस लेने में कठिनाई',
  'छाती में दर्द',
  'நெஞ்சு வலி',
  'சுவாசிப்பதில் சிரமம்',
  'छातीत दुखणे',
]

function getQuestions(t: TranslationSchema): QuestionDef[] {
  return [
    // 1. Site / Health Concern
    {
      id: 'concern',
      fieldKey: 'chiefConcern',
      label: t.history?.questions?.concern?.label || 'Chief Concern',
      getQuestion: () => t.history?.questions?.concern?.question || 'What health concern would you like to tell us about?',
      quickAnswers: () => [
        'Pain',
        'Fever',
        'Cough',
        'Headache',
        'Stomach problem',
        'Fatigue',
        'Severe chest pain',
        'Difficulty breathing',
        'Other',
      ],
      getVoiceSimulation: () => t.history?.questions?.concern?.voiceSimulation || 'I have had joint pain in my knees that has been worsening.',
      redFlagCheck: (val) => {
        const lower = val.toLowerCase()
        if (
          lower.includes('chest pain') ||
          lower.includes('difficulty breathing') ||
          lower.includes('छाती') ||
          lower.includes('सांस') ||
          lower.includes('நெஞ்சு')
        ) {
          return t.redFlags?.alertBannerTitle || 'Cardiorespiratory symptom reported. Requires immediate clinical triage screening.'
        }
        return null
      },
    },
    // 2. Location
    {
      id: 'location',
      fieldKey: 'location',
      label: t.history?.questions?.location?.label || 'Location',
      getQuestion: () => t.history?.questions?.location?.question || 'Where exactly do you feel the problem?',
      quickAnswers: () => [
        'Joint / Knee',
        'Lower back',
        'Head & Neck',
        'Chest / Upper torso',
        'Stomach / Abdomen',
        'Throat & Respiratory',
        'Whole body / Generalized',
        'Other',
      ],
      getVoiceSimulation: () => t.history?.questions?.location?.voiceSimulation || 'The discomfort is primarily in both of my knees.',
      redFlagCheck: (val, answers) => {
        if ((val.includes('Chest') || val.includes('छाती') || val.includes('நெஞ்சு')) && (answers.severity === 'Severe' || answers.severity?.includes('Severe'))) {
          return 'Severe chest discomfort reported.'
        }
        return null
      },
    },
    // 3. Onset & Duration
    {
      id: 'duration',
      fieldKey: 'duration',
      label: t.history?.questions?.duration?.label || 'Duration & Onset',
      getQuestion: (answers) => {
        const location = answers.location || 'symptoms'
        if (typeof t.history?.questions?.duration?.question === 'function') {
          return (t.history.questions.duration.question as (loc: string) => string)(location)
        }
        return `When did it start? How long have you experienced this in your ${location.toLowerCase()}?`
      },
      quickAnswers: () => ['Today', 'A few days', 'A few weeks', 'Several months', 'Longer'],
      getVoiceSimulation: () => t.history?.questions?.duration?.voiceSimulation || 'It started about three weeks ago and has been gradually increasing.',
    },
    // 4. Character / Sensation
    {
      id: 'character',
      fieldKey: 'character',
      label: t.history?.questions?.character?.label || 'Sensation & Character',
      getQuestion: () => t.history?.questions?.character?.question || 'How would you describe the sensation?',
      quickAnswers: () => [
        'Dull & Aching',
        'Sharp & Stabbing',
        'Burning sensation',
        'Throbbing / Pulsating',
        'Cramping',
        'Tightness / Pressure',
        'Stiffness & Heaviness',
        'Other',
      ],
      getVoiceSimulation: () => t.history?.questions?.character?.voiceSimulation || 'It feels like a dull aching and stiffness, especially during mornings.',
    },
    // 5. Severity
    {
      id: 'severity',
      fieldKey: 'severity',
      label: t.history?.questions?.severity?.label || 'Severity Level',
      getQuestion: () => t.history?.questions?.severity?.question || 'How severe is it?',
      quickAnswers: () => [
        'Mild',
        'Moderate',
        'Severe',
      ],
      getVoiceSimulation: () => t.history?.questions?.severity?.voiceSimulation || 'I would rate it as moderate to severe; it makes walking difficult.',
    },
    // 5B. Adaptive High Severity Follow-up (Conditional)
    {
      id: 'sudden_severity',
      fieldKey: 'onset',
      label: t.history?.questions?.sudden_severity?.label || 'Acuity / Progression',
      getQuestion: () => t.history?.questions?.sudden_severity?.question || 'Has the pain suddenly become severe?',
      isConditional: (answers) => answers.severity === 'Severe' || answers.severity?.toLowerCase().includes('severe'),
      quickAnswers: () => [
        'Yes, suddenly worsened within hours',
        'Gradually intensified over days or weeks',
        'Comes and goes in intense waves',
      ],
      getVoiceSimulation: () => t.history?.questions?.sudden_severity?.voiceSimulation || 'It gradually intensified over the last two weeks, reaching severe pain today.',
      redFlagCheck: (val) => {
        if (val.toLowerCase().includes('suddenly worsened') || val.includes('अचानक')) {
          return 'Acute onset of high severity symptoms flagged.'
        }
        return null
      },
    },
    // 6. Aggravating & Relieving Factors
    {
      id: 'factors',
      fieldKey: 'aggravatingFactors',
      label: t.history?.questions?.factors?.label || 'Aggravating & Relieving Factors',
      getQuestion: () => t.history?.questions?.factors?.question || 'Does anything make it better or worse?',
      quickAnswers: () => [
        'Movement makes it worse',
        'Rest makes it better',
        'Cold weather worsens',
        'Heat / Warmth helps',
        'Food / Eating triggers it',
        'None noticed',
      ],
      getVoiceSimulation: () => t.history?.questions?.factors?.voiceSimulation || 'Cold temperatures and walking downstairs make it worse; warm oil helps.',
    },
    // 7. Radiation / Spread
    {
      id: 'radiation',
      fieldKey: 'relievingFactors',
      label: t.history?.questions?.radiation?.label || 'Radiation & Spread',
      getQuestion: () => t.history?.questions?.radiation?.question || 'Does the problem spread to another area?',
      quickAnswers: () => [
        'Stays in one place',
        'Spreads downwards to legs',
        'Spreads to lower back',
        'Spreads to shoulders / neck',
        'Not sure',
      ],
      getVoiceSimulation: () => t.history?.questions?.radiation?.voiceSimulation || 'It mostly stays localized in both knees without spreading.',
    },
    // 8. Previous History / Recurrence
    {
      id: 'previous',
      fieldKey: 'character',
      label: t.history?.questions?.previous?.label || 'Previous History',
      getQuestion: () => t.history?.questions?.previous?.question || 'Have you experienced this before?',
      quickAnswers: () => [
        'First time experiencing this',
        'Has happened occasionally in the past',
        'Recurring chronic problem',
      ],
      getVoiceSimulation: () => t.history?.questions?.previous?.voiceSimulation || 'I have had mild joint discomfort in past winters, but never this persistent.',
    },
    // 9. Associated Information & Notes
    {
      id: 'associated',
      fieldKey: 'associatedInformation',
      label: t.history?.questions?.associated?.label || 'Associated Details',
      getQuestion: () => t.history?.questions?.associated?.question || 'Is there anything else you think your doctor should know?',
      quickAnswers: () => [
        'No other symptoms',
        'Disturbs night sleep',
        'Feeling tired / Low energy',
        'Sluggish digestion / Constipation',
        'Swelling around joints',
        'Other notes',
      ],
      getVoiceSimulation: () => t.history?.questions?.associated?.voiceSimulation || 'It wakes me up at night when turning in bed, and my digestion feels sluggish.',
    },
  ]
}

export function StepHistory() {
  const navigate = useNavigate()
  const { session, setClinicalHistory } = usePatientSession()
  const { toast } = useToast()
  const { t, currentLang } = useTranslation()

  // Dynamic answers dictionary
  const [answers, setAnswers] = useState<Record<string, string>>({
    concern: 'Pain',
    location: 'Joint / Knee',
    duration: 'A few weeks',
    character: 'Dull & Aching, with stiffness',
    severity: 'Moderate',
    sudden_severity: 'Gradually intensified over days or weeks',
    factors: 'Cold weather worsens, rest helps',
    radiation: 'Stays in one place',
    previous: 'Recurring chronic problem',
    associated: 'Disturbs night sleep',
  })

  // Current active question index in the active sequence
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [customText, setCustomText] = useState('')
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [voiceTimer, setVoiceTimer] = useState(0)
  const [simulatedTranscript, setSimulatedTranscript] = useState<string | null>(null)

  // Voice guidance state for question prompt
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false)

  // Red-flag detection state
  const [redFlagWarning, setRedFlagWarning] = useState<string | null>(null)
  const [dismissedRedFlag, setDismissedRedFlag] = useState(false)

  // Review & summary mode
  const [isCompleted, setIsCompleted] = useState(false)

  // Memoized question definitions bound to current translation
  const questionsList = useMemo(() => getQuestions(t), [t])

  // Filter active questions (evaluating conditionals like adaptive high severity)
  const activeQuestions = useMemo(() => {
    return questionsList.filter((q) => !q.isConditional || q.isConditional(answers))
  }, [questionsList, answers])

  const currentQ = activeQuestions[currentStepIndex] || activeQuestions[0]

  // Voice recording timer simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isVoiceRecording) {
      interval = setInterval(() => {
        setVoiceTimer((t) => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isVoiceRecording])

  const goToQuestion = (targetIndex: number, currentAnswers = answers) => {
    const targetQ = activeQuestions[targetIndex]
    if (targetQ) {
      setCurrentStepIndex(targetIndex)
      setCustomText(currentAnswers[targetQ.id] || '')
      setSimulatedTranscript(null)
      setIsVoiceRecording(false)
      setVoiceTimer(0)
    }
  }

  // Check red flag trigger whenever answer is set or typed
  const checkRedFlag = (val: string, answersMap: Record<string, string>) => {
    const lower = val.toLowerCase()
    const triggeredKeyword = RED_FLAG_KEYWORDS.some((kw) => lower.includes(kw))
    if (triggeredKeyword || (currentQ?.redFlagCheck && currentQ.redFlagCheck(val, answersMap))) {
      const message =
        currentQ?.redFlagCheck?.(val, answersMap) ||
        t.redFlags?.alertBannerTitle ||
        'Potentially urgent symptom pattern detected during intake.'
      setRedFlagWarning(message)
      setDismissedRedFlag(false)
      return true
    }
    return false
  }

  // Handle selecting a quick answer button
  const handleSelectQuickAnswer = (_canonicalKey: string, localizedOption: string) => {
    const updated = { ...answers, [currentQ.id]: localizedOption }
    setAnswers(updated)
    setCustomText(localizedOption)
    checkRedFlag(localizedOption, updated)
  }

  // Start voice input simulation
  const handleStartVoice = () => {
    setIsVoiceRecording(true)
    setVoiceTimer(0)
    setSimulatedTranscript(null)
    toast({
      title: 'Listening...',
      message: t.history?.listeningStatus || 'Simulated voice input active. Speak naturally.',
      type: 'info',
    })
  }

  // Stop voice input simulation
  const handleStopVoice = () => {
    setIsVoiceRecording(false)
    const transcript = currentQ.getVoiceSimulation(answers)
    setSimulatedTranscript(transcript)
    toast({
      title: 'Voice Transcription Ready',
      message: 'Simulated transcript generated for this clinical question.',
      type: 'success',
    })
  }

  // Accept simulated transcript
  const handleUseTranscript = () => {
    if (simulatedTranscript) {
      const updated = { ...answers, [currentQ.id]: simulatedTranscript }
      setAnswers(updated)
      setCustomText(simulatedTranscript)
      checkRedFlag(simulatedTranscript, updated)
      setSimulatedTranscript(null)
      handleAdvance(updated)
    }
  }

  // Read out current question with speech synthesis / simulated voice guidance
  const handleSpeakQuestion = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const text = currentQ.getQuestion(answers)
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        if (currentLang && currentLang !== 'en') {
          // Set utterance language tag matching chosen language
          const langMap: Record<string, string> = {
            hi: 'hi-IN',
            ta: 'ta-IN',
            te: 'te-IN',
            kn: 'kn-IN',
            ml: 'ml-IN',
            bn: 'bn-IN',
            mr: 'mr-IN',
          }
          if (langMap[currentLang]) {
            utterance.lang = langMap[currentLang]
          }
        }
        setIsSpeakingPrompt(true)
        utterance.onend = () => setIsSpeakingPrompt(false)
        utterance.onerror = () => setIsSpeakingPrompt(false)
        window.speechSynthesis.speak(utterance)
      } catch {
        setIsSpeakingPrompt(false)
      }
    } else {
      toast({
        title: 'Voice Guidance',
        message: currentQ.getQuestion(answers),
        type: 'info',
      })
    }
  }

  // Save current step answer and advance
  const handleAdvance = (currentAnswers = answers) => {
    const finalVal = customText.trim() || currentAnswers[currentQ.id] || 'Not specified'
    const updated = { ...currentAnswers, [currentQ.id]: finalVal }
    setAnswers(updated)
    checkRedFlag(finalVal, updated)

    if (currentStepIndex < activeQuestions.length - 1) {
      goToQuestion(currentStepIndex + 1, updated)
    } else {
      // Completed all questions! Build structured summary
      handleCompleteHistory(updated)
    }
  }

  // Previous question
  const handleBack = () => {
    if (currentStepIndex > 0) {
      goToQuestion(currentStepIndex - 1)
    } else {
      navigate('/patient/language')
    }
  }

  // Convert answers dictionary to StructuredClinicalHistory
  const handleCompleteHistory = (finalAnswers = answers) => {
    const structured: StructuredClinicalHistory = {
      chiefConcern: {
        value: finalAnswers.concern || 'Pain in joints',
        confidence: 'High',
      },
      location: {
        value: finalAnswers.location || 'Joint / Knee',
        confidence: 'High',
      },
      onset: {
        value: finalAnswers.sudden_severity || 'Gradual onset over recent weeks',
        confidence: 'High',
      },
      duration: {
        value: finalAnswers.duration || 'A few weeks',
        confidence: 'High',
      },
      character: {
        value: finalAnswers.character || 'Dull & Aching stiffness',
        confidence: 'High',
      },
      severity: {
        value: finalAnswers.severity || 'Moderate',
        confidence: 'High',
      },
      aggravatingFactors: {
        value: finalAnswers.factors || 'Cold weather, prolonged walking',
        confidence: 'Medium',
      },
      relievingFactors: {
        value: finalAnswers.radiation ? `Localized; ${finalAnswers.radiation}` : 'Rest and warmth',
        confidence: 'Medium',
      },
      associatedInformation: {
        value: finalAnswers.associated || 'Disturbs night sleep; mild digestive sluggishness',
        confidence: 'Medium',
      },
      redFlagsDetected: !!redFlagWarning,
      redFlagWarning: redFlagWarning || undefined,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportedByCaregiver: session.isCaregiverSession,
      caregiverRelationship: session.caregiverRelationship,
    }

    setClinicalHistory(structured)
    setIsCompleted(true)
    toast({
      title: 'Clinical History Captured',
      message: 'Responses organized into standardized SOCRATES summary.',
      type: 'success',
    })
  }

  // Proceed to Segment 3 AYUSH assessment
  const handleProceedToAyush = () => {
    navigate('/patient/ayush')
  }

  // Progress calculation
  const progressPercent = Math.round(((currentStepIndex + 1) / activeQuestions.length) * 100)

  // Confidence badge color helper
  const renderConfidenceBadge = (confidence: 'High' | 'Medium' | 'Low') => {
    const styles = {
      High: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Medium: 'bg-blue-50 text-blue-800 border-blue-200',
      Low: 'bg-amber-50 text-amber-800 border-amber-200',
    }
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[confidence]}`}>
        {confidence} {t.common?.confidence || 'Confidence'}
      </span>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card variant="default">
        {/* Header with patient details and language strip */}
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="ayush">
              {t.common?.stepOf ? t.common.stepOf(4, 10) : 'Step 4 of 10'} • {t.stepper?.history?.title || 'Clinical History'}
            </Badge>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              Conversation language: {session.selectedLanguageName || 'English'}
            </span>
          </div>

          <div>
            <CardTitle className="text-2xl text-slate-900">
              {t.history?.title || 'Clinical History'}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-1">
              {t.history?.subtitle || "Let's understand your health concerns through a few simple questions."}
            </CardDescription>
          </div>

          {/* Patient Context & Progress Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-ayush-primary/10 text-ayush-primary font-bold flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">
                  {session.patientName || 'Ananya Krishnan'}
                </strong>
                <span className="text-slate-500">
                  {session.age ? `${session.age} Y` : '42 Y'} • {session.gender || 'Female'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={session.isReturningPatient ? 'ayush' : 'default'}>
                {session.isReturningPatient ? 'Returning Patient' : 'New Patient'}
              </Badge>
              {session.abhaId && (
                <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
                  {session.abhaId}
                </span>
              )}
            </div>
          </div>

          {/* Caregiver Mode Banner (Requirement 9) */}
          {session.isCaregiverSession && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5 animate-in fade-in">
              <Users className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-xs font-extrabold uppercase tracking-wide text-amber-900 block">
                  {t.caregiver?.answeringOnBehalf || 'Answering on behalf of the patient'}
                </strong>
                <p className="text-xs font-medium text-amber-900">
                  {t.caregiver?.recordedAsReported
                    ? `${t.caregiver.recordedAsReported} (${session.caregiverRelationship || 'Family Member'})`
                    : `Your responses will be recorded as reported by the caregiver (Relationship: ${session.caregiverRelationship || 'Family Member'}).`}
                </p>
              </div>
            </div>
          )}

          {/* Red-Flag Alert Card (Requirement 7) */}
          {redFlagWarning && !dismissedRedFlag && (
            <div className="p-4.5 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                      {t.redFlags?.alertBannerTitle || 'Important: Please alert the healthcare staff immediately.'}
                    </h4>
                    <p className="text-xs font-medium text-rose-950 mt-1 leading-relaxed">
                      {t.redFlags?.highlightStaff || 'This information will be highlighted for the healthcare professional.'}
                    </p>
                    <p className="text-xs text-rose-800/90 mt-0.5">
                      {redFlagWarning} {t.redFlags?.disclaimer || 'MediKiosk does not make an emergency medical diagnosis; acute symptoms require prompt triage by on-duty medical staff.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: 'Staff Assistance Alerted',
                          message: 'Kiosk triage attendant has been notified for in-person assessment.',
                          type: 'info',
                        })
                      }}
                      leftIcon={<Bell className="w-4 h-4" />}
                      className="bg-rose-700 hover:bg-rose-800 text-white"
                    >
                      {t.redFlags?.alertStaffButton || 'Alert Healthcare Staff'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDismissedRedFlag(true)}
                      className="border-rose-300 text-rose-900 hover:bg-rose-100"
                    >
                      {t.redFlags?.acknowledgeButton || 'I acknowledge • Continue with alert flagged'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Progress Bar (when interview is active) */}
          {!isCompleted && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  Question {currentStepIndex + 1} of {activeQuestions.length}:{' '}
                  <strong className="text-slate-800 font-bold">{currentQ.label}</strong>
                </span>
                <span className="font-semibold text-ayush-primary">
                  {progressPercent}% {t.common?.complete || 'complete'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ayush-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ============================================================
              A. INTERVIEW MODE: One question at a time
             ============================================================ */}
          {!isCompleted && (
            <div className="space-y-6">
              {/* Question Card Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                {/* AI-assisted question label & voice guidance button */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {t.history?.aiAssistedQuestion || 'AI-assisted question'}
                  </span>

                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      isSpeakingPrompt
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Listen to question"
                    aria-label="Listen to question read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeakingPrompt ? (t.history?.reading || 'Reading...') : (t.history?.listen || 'Listen')}</span>
                  </button>
                </div>

                {/* Primary Question Prompt */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentQ.getQuestion(answers)}
                </h3>

                {/* Quick Answer Buttons (Requirement 4) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.history?.quickAnswersTitle || 'Quick Answers (Touch or Click)'}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {currentQ.quickAnswers(answers).map((canonicalKey) => {
                      const localizedOption = t.history?.quickAnswers?.[canonicalKey] || canonicalKey
                      const isSelected =
                        answers[currentQ.id]?.toLowerCase() === canonicalKey.toLowerCase() ||
                        answers[currentQ.id]?.toLowerCase() === localizedOption.toLowerCase() ||
                        customText.toLowerCase() === canonicalKey.toLowerCase() ||
                        customText.toLowerCase() === localizedOption.toLowerCase()

                      return (
                        <button
                          key={canonicalKey}
                          type="button"
                          onClick={() => handleSelectQuickAnswer(canonicalKey, localizedOption)}
                          className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer select-none active:scale-98 ${
                            isSelected
                              ? 'bg-ayush-surface border-ayush-primary text-ayush-primary shadow-xs ring-2 ring-ayush-primary/20'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-ayush-primary stroke-[3]" />}
                          <span>{localizedOption}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Text Input Option */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label
                    htmlFor="custom-answer-input"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {t.history?.typeSpecificResponse || 'Or type your specific response'}
                  </label>
                  <textarea
                    id="custom-answer-input"
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value)
                      checkRedFlag(e.target.value, answers)
                    }}
                    placeholder={t.history?.typePlaceholder || 'Describe your symptoms in your own words...'}
                    rows={2}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:border-ayush-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Voice Input Simulation (Requirement 5) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={isVoiceRecording ? handleStopVoice : handleStartVoice}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xs ${
                          isVoiceRecording
                            ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                            : 'bg-ayush-primary text-white hover:bg-ayush-primary-dark'
                        }`}
                        aria-label={isVoiceRecording ? 'Stop voice recording' : 'Speak your answer'}
                      >
                        {isVoiceRecording ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {isVoiceRecording
                            ? `${t.history?.listeningStatus || 'Listening...'} (${voiceTimer}s)`
                            : (t.history?.voiceTitle || 'Speak your answer')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isVoiceRecording
                            ? (t.history?.voiceRecordingNotice || 'Speak clearly into the kiosk microphone')
                            : (t.history?.voiceSimPrompt || 'Tap to simulate spoken clinical response')}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                      {t.history?.voiceTag || 'Voice Simulation'}
                    </span>
                  </div>

                  {/* Simulated Transcription Display */}
                  {simulatedTranscript && (
                    <div className="p-3.5 rounded-xl bg-white border border-ayush-border/80 space-y-2.5 animate-in fade-in">
                      <div className="text-xs text-slate-500 font-medium">
                        {t.history?.simulatedTranscriptLabel || 'Simulated transcription:'}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 italic bg-ayush-surface/30 p-2.5 rounded-lg">
                        &ldquo;{simulatedTranscript}&rdquo;
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleUseTranscript}
                          leftIcon={<Check className="w-4 h-4" />}
                        >
                          {t.history?.useThisAnswer || 'Use this answer'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSimulatedTranscript(null)
                            handleStartVoice()
                          }}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          {t.history?.tryAgain || 'Try again'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {currentStepIndex === 0
                    ? `${t.common?.back || 'Previous'}: ${t.stepper?.language?.title || 'Language'}`
                    : (t.history?.previousQuestion || 'Previous Question')}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleAdvance()}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {currentStepIndex === activeQuestions.length - 1
                    ? (t.history?.completeReview || 'Complete & Review History')
                    : (t.history?.nextQuestion || 'Next Question')}
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================
              B. SUMMARY & REVIEW MODE ("History captured" - Requirement 10)
             ============================================================ */}
          {isCompleted && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Success Banner */}
              <div className="p-6 rounded-3xl bg-ayush-surface border border-ayush-border text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-ayush-primary text-white mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {t.history?.historyCaptured || 'History captured'}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                    {t.history?.socratesGuideline || 'Your clinical information has been structured using standardized SOCRATES guidelines. Please review before proceeding.'}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                  {t.history?.readyAyush || 'Ready for AYUSH Prakriti & Agni assessment'}
                </div>
              </div>

              {/* Structured Summary Cards Grid (Requirement 10) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <span>{t.history?.structuredFindings || 'Structured Clinical Findings'}</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    {t.history?.clickEditHint || 'Click "Edit" on any card to update responses'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* 1. Chief Concern */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.concern?.label || 'Chief concern'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.concern || 'Pain'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(0)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 2. Location */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.location?.label || 'Location'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.location || 'Joint / Knee'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(1)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 3. Onset */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.sudden_severity?.label || 'Onset'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.sudden_severity || 'Gradual onset, steady'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(2)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 4. Duration */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.duration?.label || 'Duration'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.duration || 'A few weeks'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(2)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 5. Character */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.character?.label || 'Character'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.character || 'Dull & Aching'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(3)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 6. Severity */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.severity?.label || 'Severity'}
                      </span>
                      {renderConfidenceBadge('High')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.severity || 'Moderate'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(4)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 7. Aggravating factors */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.factors?.label || 'Aggravating factors'}
                      </span>
                      {renderConfidenceBadge('Medium')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.factors || 'Cold weather worsens'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(5)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 8. Relieving factors */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.radiation?.label || 'Relieving factors'}
                      </span>
                      {renderConfidenceBadge('Medium')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.radiation ? `Localized; ${answers.radiation}` : 'Rest and warmth help'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(6)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>

                  {/* 9. Associated information */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {t.history?.questions?.associated?.label || 'Associated information'}
                      </span>
                      {renderConfidenceBadge('Medium')}
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {answers.associated || 'Disturbs night sleep; mild digestive sluggishness'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false)
                        goToQuestion(activeQuestions.length - 1)
                      }}
                      className="text-xs font-semibold text-ayush-primary hover:underline flex items-center gap-1 pt-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.common?.edit || 'Edit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Answers Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold text-slate-900 block">
                    {t.history?.reviewAnswersTitle || 'Review answers'}
                  </strong>
                  <span className="text-xs text-slate-500">
                    {t.history?.revisitInterview || 'Want to revisit the guided interview from the beginning?'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCompleted(false)
                    goToQuestion(0)
                  }}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  {t.history?.reviewFromQ1 || 'Review from Question 1'}
                </Button>
              </div>

              {/* Navigation Controls (Requirement 11) */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/patient/language')}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {t.common?.back || 'Previous'}: {t.stepper?.language?.title || 'Language'}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToAyush}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {t.history?.continueAyush || 'Continue to AYUSH Assessment'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
