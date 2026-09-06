import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Languages,
  Sparkles,
  QrCode,
  Play,
  Square,
  User,
  Users,
  Clock,
  Check,
  AlertCircle,
  FileText,
  UserCheck,
  Calendar,
  Phone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import type { CaregiverRelationship } from '@/types'
import { useTranslation, LANGUAGES_LIST } from '@/translations'

// Helper for Navigation Footer on Steps
function StepNav({
  prevPath,
  nextPath,
  nextLabel = 'Save & Continue',
  onNext,
  disabled = false,
  disabledReason,
}: {
  prevPath?: string
  nextPath?: string
  nextLabel?: string
  onNext?: () => void
  disabled?: boolean
  disabledReason?: string
}) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
      {prevPath ? (
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(prevPath)}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Previous Step
        </Button>
      ) : (
        <div />
      )}
      {nextPath && (
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
          <Button
            variant="primary"
            size="lg"
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              if (onNext) onNext()
              navigate(nextPath)
            }}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            {nextLabel}
          </Button>
          {disabled && disabledReason && (
            <span className="text-xs text-amber-700 font-medium">{disabledReason}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 1. StepIdentify Screen (Segment 1)
// ==========================================
export function StepIdentify() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, setReturningDemoPatient, setNewPatientData, setCaregiverProxy } = usePatientSession()
  const { toast } = useToast()

  // Tab mode: 'abha' | 'new'
  const [activeTab, setActiveTab] = useState<'abha' | 'new'>(
    session.patientType === 'new' ? 'new' : 'abha'
  )

  // ABHA flow state
  const [abhaInput, setAbhaInput] = useState(session.abhaId || 'XX-XXXX-XXXX-4821')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(session.isReturningPatient)

  // New Patient flow state
  const [fullName, setFullName] = useState(session.patientType === 'new' ? session.patientName : '')
  const [ageOrDob, setAgeOrDob] = useState(session.patientType === 'new' ? String(session.age || '') : '')
  const [gender, setGender] = useState(session.patientType === 'new' ? session.gender : 'Female')
  const [mobile, setMobile] = useState(session.patientType === 'new' ? (session.mobile || '') : '')
  const [formErrors, setFormErrors] = useState<{ fullName?: string; ageOrDob?: string }>({})

  // Caregiver / Proxy state
  const isProxyFromUrl = searchParams.get('proxy') === 'true'
  const [isCaregiver, setIsCaregiver] = useState(
    () => session.isCaregiverSession || isProxyFromUrl
  )
  const [relationship, setRelationship] = useState<CaregiverRelationship>(
    () => (session.caregiverRelationship as CaregiverRelationship) || 'Family Member'
  )

  useEffect(() => {
    if (isProxyFromUrl && !session.isCaregiverSession) {
      setCaregiverProxy(true, 'Family Member')
    }
  }, [isProxyFromUrl, session.isCaregiverSession, setCaregiverProxy])

  // Handle simulated ABHA verification
  const handleVerifyAbha = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setIsVerified(true)
      setReturningDemoPatient(isCaregiver, relationship)
      toast({
        title: 'ABHA Record Verified',
        message: 'Returning patient Ananya Krishnan identified via simulated ABDM Sandbox.',
        type: 'success',
      })
    }, 650)
  }

  // Handle Caregiver toggle
  const handleToggleCaregiver = (enabled: boolean) => {
    setIsCaregiver(enabled)
    setCaregiverProxy(enabled, enabled ? relationship : undefined)
  }

  const handleRelationshipChange = (rel: CaregiverRelationship) => {
    setRelationship(rel)
    if (isCaregiver) {
      setCaregiverProxy(true, rel)
    }
  }

  // Continue handler for ABHA
  const handleContinueAbha = () => {
    if (!isVerified) {
      // Auto-verify if user clicks continue directly
      setReturningDemoPatient(isCaregiver, relationship)
    } else {
      setReturningDemoPatient(isCaregiver, relationship)
    }
    navigate('/patient/consent')
  }

  // Continue handler for New Patient
  const handleContinueNewPatient = () => {
    const errors: { fullName?: string; ageOrDob?: string } = {}
    if (!fullName.trim()) {
      errors.fullName = 'Please enter patient full name.'
    }
    if (!ageOrDob.trim()) {
      errors.ageOrDob = 'Please enter patient age or date of birth.'
    }
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Missing Required Information',
        message: 'Please complete patient full name and age/DOB.',
        type: 'warning',
      })
      return
    }

    setNewPatientData({
      fullName: fullName.trim(),
      ageOrDob: ageOrDob.trim(),
      gender,
      mobile: mobile.trim(),
      isCaregiver,
      relationship: isCaregiver ? relationship : undefined,
    })
    navigate('/patient/consent')
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card variant="default">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="ayush">Step 1 of 10 • Patient Identification</Badge>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ABDM Sandbox • Simulated Verification
            </span>
          </div>
          <CardTitle className="text-2xl mt-2 text-slate-900">
            Patient Identification
          </CardTitle>
          <CardDescription>
            Identify using your Ayushman Bharat Health Account (ABHA) or register as a new patient.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('abha')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'abha'
                  ? 'bg-white text-ayush-primary shadow-xs border border-ayush-border/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-ayush-primary" />
              <span>Identify with ABHA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'new'
                  ? 'bg-white text-ayush-primary shadow-xs border border-ayush-border/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-ayush-primary" />
              <span>Continue as New Patient</span>
            </button>
          </div>

          {/* Section C: Caregiver / Proxy Accessible Option (Persistent) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 transition-all space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCaregiver}
                onChange={(e) => handleToggleCaregiver(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 accent-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="select-none">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  Someone else is answering (Caregiver / Proxy Assisted Intake)
                </span>
                <p className="text-xs text-slate-600">
                  Select this if answering questions on behalf of a parent, child, or relative.
                </p>
              </div>
            </label>

            {isCaregiver && (
              <div className="pt-2 border-t border-amber-200/60 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Who are you answering for?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Parent / Guardian', 'Family Member', 'Caregiver', 'Other'] as CaregiverRelationship[]).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleRelationshipChange(option)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          relationship === option
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  Intake mode: Caregiver responses will be recorded with proxy relationship metadata. The patient remains independently identified.
                </p>
              </div>
            )}
          </div>

          {/* TAB A: Identify with ABHA */}
          {activeTab === 'abha' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border border-ayush-border bg-ayush-surface/30 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Identify with ABHA</h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Use your ABHA number to securely identify your existing patient record.
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    label="Enter ABHA Number"
                    placeholder="XX-XXXX-XXXX-4821"
                    value={abhaInput}
                    onChange={(e) => {
                      setAbhaInput(e.target.value)
                      setIsVerified(false)
                    }}
                    helperText="Evaluation Demo: Uses simulated ABDM identity sandbox."
                    leftIcon={<QrCode className="w-5 h-5 text-slate-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setAbhaInput('XX-XXXX-XXXX-4821')}
                        className="text-xs font-bold text-ayush-primary hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                        title="Fill sample demo ABHA"
                      >
                        Preset Demo
                      </button>
                    }
                    kioskSize
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleVerifyAbha}
                    disabled={isVerifying}
                    leftIcon={<UserCheck className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    {isVerifying ? 'Verifying with ABDM...' : isVerified ? 'Re-Verify ABHA' : 'Verify ABHA'}
                  </Button>

                  <span className="text-xs text-slate-500 font-medium">
                    (Verification is SIMULATED for evaluation)
                  </span>
                </div>
              </div>

              {/* Verified Returning Patient Display & Returning Patient Experience */}
              {isVerified && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Verified Card */}
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                        <div>
                          <h4 className="text-lg font-bold text-emerald-950">
                            Welcome back, Ananya
                          </h4>
                          <span className="text-xs font-semibold text-emerald-800">
                            Previous assessment available
                          </span>
                        </div>
                      </div>
                      <Badge variant="ayush">ABDM Verified</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                        <span className="text-slate-500 block">Patient Name</span>
                        <strong className="text-slate-900 text-sm font-bold">Ananya Krishnan</strong>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                        <span className="text-slate-500 block">Age & Gender</span>
                        <strong className="text-slate-900 text-sm font-bold">42 Y / Female</strong>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                        <span className="text-slate-500 block">ABHA Identifier</span>
                        <strong className="text-slate-900 text-sm font-mono font-bold">XX-XXXX-XXXX-4821</strong>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                        <span className="text-slate-500 block">Last OPD Visit</span>
                        <strong className="text-slate-900 text-sm font-bold">15 August 2026</strong>
                      </div>
                    </div>
                  </div>

                  {/* Friendly Returning Patient Experience Information Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-ayush-primary font-bold text-base">
                      <Clock className="w-5 h-5 text-ayush-primary" />
                      <h4>Welcome back</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Your previous clinical history is available. Next, we&apos;ll only ask about information that may have changed since your last visit.
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      This will reduce repeated questions during your outpatient assessment.
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5" />
                        Delta Mode data prepared for physician consultation
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContinueAbha}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Continue to Consent
                </Button>
              </div>
            </div>
          )}

          {/* TAB B: Continue as New Patient */}
          {activeTab === 'new' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">New Patient Registration</h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Enter basic demographic details to create a new clinical session.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Priyadarshini Sundaram"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: undefined }))
                    }}
                    error={formErrors.fullName}
                    required
                    kioskSize
                    leftIcon={<User className="w-5 h-5 text-slate-400" />}
                  />

                  <Input
                    label="Age (Years) or Date of Birth"
                    placeholder="e.g. 36 or 1990-04-15"
                    value={ageOrDob}
                    onChange={(e) => {
                      setAgeOrDob(e.target.value)
                      if (formErrors.ageOrDob) setFormErrors((prev) => ({ ...prev, ageOrDob: undefined }))
                    }}
                    error={formErrors.ageOrDob}
                    required
                    kioskSize
                    leftIcon={<Calendar className="w-5 h-5 text-slate-400" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    kioskSize
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>

                  <Input
                    label="Mobile Number (Optional)"
                    placeholder="e.g. +91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    kioskSize
                    leftIcon={<Phone className="w-5 h-5 text-slate-400" />}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContinueNewPatient}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Continue to Consent
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// 2. StepConsent Screen (Segment 1)
// ==========================================
export function StepConsent() {
  const navigate = useNavigate()
  const { session, setConsent } = usePatientSession()
  const { t, currentLang } = useTranslation()
  const { toast } = useToast()

  // Consent states
  const [requiredConsent, setRequiredConsent] = useState(session.consentGiven)
  const [aiConsent, setAiConsent] = useState(session.aiConsentGiven)

  // Simulated audio playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioTimer, setAudioTimer] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioTimer((prev) => {
          if (prev >= 18) {
            setIsPlayingAudio(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlayingAudio])

  const toggleSimulatedAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false)
      setAudioTimer(0)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      toast({
        title: 'Audio Consent Paused',
        message: 'Simulated playback stopped.',
        type: 'info',
      })
    } else {
      setIsPlayingAudio(true)
      setAudioTimer(0)
      toast({
        title: 'Audio Consent Playing',
        message: t.consent?.audioDesc || 'Audio reading of consent terms has started.',
        type: 'info',
      })

      // If Web Speech API is supported, speak in selected language if possible
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
          const utteranceText = `${t.consent?.whyCollectDesc || ''} ${t.consent?.disclaimerDesc || ''}`
          const utterance = new SpeechSynthesisUtterance(utteranceText)
          utterance.lang = currentLang || 'en'
          utterance.rate = 0.95
          utterance.onend = () => {
            setIsPlayingAudio(false)
            setAudioTimer(0)
          }
          utterance.onerror = () => {
            setIsPlayingAudio(false)
            setAudioTimer(0)
          }
          window.speechSynthesis.speak(utterance)
        } catch {
          // Fallback to simulated timer
        }
      }
    }
  }

  const handleContinue = () => {
    if (!requiredConsent) {
      toast({
        title: 'Consent Required',
        message: t.consent?.validationWarning || 'Please review and accept the required clinical intake consent to continue.',
        type: 'warning',
      })
      return
    }

    // Stop speech if playing
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setConsent(requiredConsent, aiConsent)
    navigate('/patient/language')
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card variant="default">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="ayush">{t.consent?.badge || 'Step 2 of 10 • Consent & Privacy'}</Badge>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {t.consent?.securityTag || 'Patient Rights & Security'}
            </span>
          </div>
          <CardTitle className="text-2xl mt-2 text-slate-900">
            {t.consent?.title || 'Your Consent & Privacy'}
          </CardTitle>
          <CardDescription>
            {t.consent?.subtitle || 'We respect your privacy. Here is why we collect your information and how it is used during your visit.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Information Sections Grid */}
          <div className="space-y-3.5">
            {/* 1. Why we collect your information */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-ayush-primary tracking-wider uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-ayush-primary" />
                {t.consent?.whyCollectTitle || 'Why We Collect Your Information'}
              </h4>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {t.consent?.whyCollectDesc || 'Your responses help create a structured clinical history for your healthcare provider.'}
              </p>
            </div>

            {/* 2. How your information is used */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-ayush-primary tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-ayush-primary" />
                {t.consent?.howUsedTitle || 'How Your Information Is Used'}
              </h4>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {t.consent?.howUsedDesc || 'Your information is used to support your clinical assessment and prepare a summary for the healthcare professional.'}
              </p>
            </div>

            {/* 3. Your control */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-ayush-primary tracking-wider uppercase flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-ayush-primary" />
                {t.consent?.yourControlTitle || 'Your Control'}
              </h4>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {t.consent?.yourControlDesc || 'You can review and provide consent before continuing.'}
              </p>
            </div>

            {/* 4. AI assistance */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-ayush-primary tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-ayush-primary" />
                {t.consent?.aiAssistanceTitle || 'AI Assistance'}
              </h4>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {t.consent?.aiAssistanceDesc || 'AI may help organize and summarize the information you provide.'}
              </p>
            </div>

            {/* 5. Important Disclaimer (Protected wording) */}
            <div className="p-4.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900 tracking-wider uppercase">
                    {t.consent?.disclaimerTitle || 'Important Disclaimer'}
                  </h4>
                  <p className="text-sm font-medium text-amber-950 mt-1 leading-relaxed">
                    {t.consent?.disclaimerDesc || 'AI does not make an autonomous diagnosis. Final clinical decisions remain with the qualified healthcare professional.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Audio Consent Player */}
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSimulatedAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white animate-pulse ring-4 ring-amber-200'
                    : 'bg-ayush-primary text-white hover:bg-ayush-primary-dark'
                }`}
                aria-label={isPlayingAudio ? 'Stop audio consent playback' : 'Play audio consent'}
              >
                {isPlayingAudio ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  {t.consent?.audioTitle || 'Simulated audio consent'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPlayingAudio
                    ? (t.consent?.audioPlaying ? t.consent.audioPlaying(audioTimer) : `Playing audio consent (${audioTimer}s / 18s)...`)
                    : (t.consent?.audioDesc || 'Tap to listen to consent details in clear audio format.')}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 uppercase px-2.5 py-1 bg-white border border-slate-200 rounded-lg self-start sm:self-auto">
              {t.consent?.audioBadge || 'Simulated audio'}
            </span>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            {/* Required Checkbox */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                requiredConsent
                  ? 'bg-ayush-surface/50 border-ayush-primary ring-1 ring-ayush-primary/30'
                  : 'bg-white border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={requiredConsent}
                onChange={(e) => setRequiredConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-ayush-primary accent-ayush-primary focus:ring-ayush-primary cursor-pointer shrink-0"
              />
              <div className="select-none">
                <span className="text-sm font-bold text-slate-900 block">
                  {t.consent?.requiredConsent || 'I understand why my information is being collected and consent to continue.'}{' '}
                  <span className="text-red-500 text-xs font-semibold ml-1">({t.common?.required || 'Required'})</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.consent?.whyCollectDesc || 'Allows MediKiosk to document your symptoms for your attending physician.'}
                </p>
              </div>
            </label>

            {/* Optional Checkbox */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                aiConsent
                  ? 'bg-ayush-surface/50 border-ayush-primary ring-1 ring-ayush-primary/30'
                  : 'bg-white border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-ayush-primary accent-ayush-primary focus:ring-ayush-primary cursor-pointer shrink-0"
              />
              <div className="select-none">
                <span className="text-sm font-bold text-slate-900 block">
                  {t.consent?.aiConsent || 'I consent to AI-assisted processing of my responses.'}{' '}
                  <span className="text-slate-500 text-xs font-semibold ml-1">({t.common?.optional || 'Optional'})</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.consent?.aiAssistanceDesc || 'Authorizes AI to summarize and cross-reference your descriptions against standard clinical taxonomies.'}
                </p>
              </div>
            </label>
          </div>

          {/* Navigation Controls */}
          <StepNav
            prevPath="/patient/identify"
            nextPath="/patient/language"
            nextLabel={t.common?.continue || 'Continue to Language'}
            disabled={!requiredConsent}
            disabledReason={t.consent?.validationWarning || 'Required consent checkbox must be selected to proceed'}
            onNext={handleContinue}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// 3. StepLanguage Screen (Segment 1)
// ==========================================
export function StepLanguage() {
  const navigate = useNavigate()
  const { session, setLanguage } = usePatientSession()
  const { t, currentLang } = useTranslation()
  const { toast } = useToast()

  const [selectedLang, setSelectedLang] = useState<string>(session.selectedLanguage || 'en')

  const currentLangObj =
    LANGUAGES_LIST.find((l) => l.code === selectedLang) ||
    LANGUAGES_LIST.find((l) => l.code === currentLang) ||
    LANGUAGES_LIST[0]

  const handleSelectLanguage = (code: string, name: string) => {
    setSelectedLang(code)
    setLanguage(code, name)
    toast({
      title: `${name}`,
      message: `Language updated to ${name}. Prompts and intake questionnaire will immediately reflect ${name}.`,
      type: 'info',
    })
  }

  const handleContinue = () => {
    setLanguage(currentLangObj.code, currentLangObj.name)
    navigate('/patient/history')
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card variant="default">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="ayush">{t.language?.badge || 'Step 3 of 10 • Language Selection'}</Badge>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {t.language?.tag || 'Multilingual Terminal'}
            </span>
          </div>
          <CardTitle className="text-2xl mt-2 text-slate-900">
            {t.language?.title || 'Choose Your Language'}
          </CardTitle>
          <CardDescription>
            {t.language?.subtitle || 'Select the language you are most comfortable using.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Large Touch-Friendly Language Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {LANGUAGES_LIST.map((lang) => {
              const isSelected = selectedLang === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code, lang.name)}
                  className={`min-h-[96px] p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-ayush-surface border-ayush-primary shadow-sm ring-2 ring-ayush-primary/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-slate-900">
                      {lang.native}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-ayush-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {lang.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {lang.dialectNote}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Small Confirmation & Sample Area */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-emerald-700 shrink-0" />
              <strong className="text-sm font-bold text-emerald-950">
                {t.language?.selectedConfirmation
                  ? t.language.selectedConfirmation(currentLangObj.name)
                  : `Selected language: ${currentLangObj.name}`}
              </strong>
            </div>
            <p className="text-xs text-emerald-900 pl-7">
              {t.language?.answerInLanguage
                ? t.language.answerInLanguage(currentLangObj.name)
                : `You can answer questions in ${currentLangObj.name}.`}
            </p>
            <p className="text-[11px] text-emerald-700/80 pl-7">
              {t.language?.simulationNotice
                ? t.language.simulationNotice(currentLangObj.name)
                : `(All upcoming questions and voice prompts are configured in ${currentLangObj.name})`}
            </p>
            {selectedLang === 'other' && t.language?.otherNotice && (
              <p className="text-[11px] text-amber-800 pl-7 font-medium">
                {t.language.otherNotice}
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <StepNav
            prevPath="/patient/consent"
            nextPath="/patient/history"
            nextLabel={t.language?.continueToHistory || t.common?.continue || 'Continue to History'}
            onNext={handleContinue}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// 4. StepHistory Screen (Segment 2 - AI-Assisted Clinical History)
// ==========================================
export { StepHistory } from './StepHistory'

// ==========================================
// 5. StepAyush Screen (Segment 3 - Delta Mode + AYUSH Assessment)
// ==========================================
export { StepAyush } from './StepAyush'

// ==========================================
// 6. StepJihva Screen (Segment 4 - Jihva Assessment)
// ==========================================
export { StepJihva } from './StepJihva'

// ==========================================
// 7. StepNadi Screen (Segment 4 - Nadi Assessment)
// ==========================================
export { StepNadi } from './StepNadi'

// ==========================================
// 8. StepDocuments Screen (Segment 4 - Documents, OCR, Timeline)
// ==========================================
export { StepDocuments } from './StepDocuments'
export { StepSummary } from './StepSummary'
export { StepToken } from './StepToken'
