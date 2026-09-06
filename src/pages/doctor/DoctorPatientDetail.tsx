import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  X,
  Layers,
  Info,
  Calendar,
  RotateCcw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { MOCK_ANANYA_DETAILED_PATIENT, MOCK_DETAILED_PATIENT } from '@/data/mockData'

type ReviewDecision = 'Verified' | 'Needs review' | 'Rejected'

interface ReviewableField {
  id: string
  label: string
  value: string
  section: string
  confidence: 'High' | 'Medium' | 'Low'
  source: string
  decision: ReviewDecision
  doctorNote?: string
}

export function DoctorPatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Select patient model based on ID (defaults to Ananya for returning patient delta verification)
  const isAnanya = id === 'pat-ananya' || id === undefined || id === '' || !id.startsWith('pat-001')
  const patientData = isAnanya ? MOCK_ANANYA_DETAILED_PATIENT : MOCK_DETAILED_PATIENT

  // Overall summary verification state
  const [isOverallVerified, setIsOverallVerified] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [activeSourceField, setActiveSourceField] = useState<ReviewableField | null>(null)

  // Field edit modal state
  const [editingField, setEditingField] = useState<ReviewableField | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editDoctorNote, setEditDoctorNote] = useState('')

  // Interactive review decisions for all clinical fields
  const [fields, setFields] = useState<ReviewableField[]>([
    {
      id: 'f-concern',
      label: 'Primary Chief Concern',
      value: patientData.history.chiefComplaint,
      section: 'Clinical History',
      confidence: 'High',
      source: 'Patient verbal intake transcribed at kiosk',
      decision: 'Verified',
    },
    {
      id: 'f-duration',
      label: 'Duration & Progression',
      value: patientData.history.duration,
      section: 'Clinical History',
      confidence: 'High',
      source: 'Patient voice and interactive confirmation',
      decision: 'Verified',
    },
    {
      id: 'f-symptoms',
      label: 'Associated Lakshanas (Symptoms)',
      value: patientData.history.associatedSymptoms.join(', '),
      section: 'Clinical History',
      confidence: 'High',
      source: 'Clinical intake questionnaire',
      decision: 'Needs review',
    },
    {
      id: 'f-delta-health',
      label: 'Delta: General Health Change',
      value: isAnanya
        ? 'Changed — New concern: Headache with right knee stiffness; prior respiratory cough resolved'
        : 'First visit baseline recorded',
      section: 'Delta Changes',
      confidence: 'High',
      source: 'Returning patient Delta module',
      decision: 'Verified',
    },
    {
      id: 'f-delta-sleep',
      label: 'Delta: Sleep Reduction',
      value: isAnanya
        ? 'Sleep: 6 hours → 5 hours with occasional night waking (Changed since 15 August 2026 visit)'
        : 'Baseline 6 hours reported',
      section: 'Delta Changes',
      confidence: 'Medium',
      source: 'Patient response comparison with 15 Aug 2026 EHR',
      decision: 'Verified',
    },
    {
      id: 'f-prakriti',
      label: 'AYUSH Prakriti Typology',
      value: `${patientData.ayushAssessment.prakriti} (V:${patientData.ayushAssessment.scores.vata}%, P:${patientData.ayushAssessment.scores.pitta}%, K:${patientData.ayushAssessment.scores.kapha}%)`,
      section: 'AYUSH Assessment',
      confidence: 'High',
      source: 'Standardized NAMASTE AYUSH Prakriti Questionnaire',
      decision: 'Verified',
    },
    {
      id: 'f-agni',
      label: 'Agni (Digestive Fire Status)',
      value: patientData.ayushAssessment.agni,
      section: 'AYUSH Assessment',
      confidence: 'Medium',
      source: 'Patient self-reported bowel and hunger symptoms',
      decision: 'Verified',
    },
    {
      id: 'f-jihva',
      label: 'Jihva Pariksha (Tongue)',
      value: `${patientData.jihvaPariksha.coatingColor}; ${patientData.jihvaPariksha.moisture}`,
      section: 'Jihva Assessment',
      confidence: 'High',
      source: 'Optical camera image evaluated by localized computer vision',
      decision: 'Verified',
    },
    {
      id: 'f-nadi',
      label: 'Nadi Pariksha (Pulse)',
      value: `${patientData.nadiPariksha.gati}, ${patientData.nadiPariksha.rateBpm} BPM (${patientData.nadiPariksha.rhythm})`,
      section: 'Nadi Assessment',
      confidence: 'Medium',
      source: 'Supplementary Digital PPG Pulse Sensor waveform',
      decision: 'Needs review',
    },
    {
      id: 'f-meds',
      label: 'Current Formulations & Drugs',
      value: patientData.history.currentMedications.join(' • '),
      section: 'Documents & Medications',
      confidence: 'Medium',
      source: 'AIIA Prescription OCR extraction & patient history',
      decision: 'Verified',
    },
    {
      id: 'f-impression',
      label: 'AI Diagnostic Impression',
      value: patientData.aiSummary.diagnosticImpression,
      section: 'AI Diagnostic Summary',
      confidence: 'High',
      source: 'Rule-based clinical inference engine draft',
      decision: 'Needs review',
    },
    {
      id: 'f-rationale',
      label: 'Chikitsa Sutra (Treatment Rationale)',
      value: patientData.aiSummary.treatmentRationale,
      section: 'AI Diagnostic Summary',
      confidence: 'High',
      source: 'Standardized classical Charaka Samhita Chikitsa formulation guidelines',
      decision: 'Verified',
    },
    {
      id: 'f-redflags',
      label: 'Red Flag Safety Audit',
      value: patientData.history.redFlagAudit,
      section: 'Red Flags',
      confidence: 'High',
      source: 'Automated emergency triage rule engine',
      decision: 'Verified',
    },
  ])

  // Field decision changers
  const handleDecision = (id: string, decision: ReviewDecision) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, decision } : f))
    )
    toast({
      title: `Field Marked as ${decision}`,
      message: `Updated review decision for field.`,
      type: decision === 'Verified' ? 'success' : decision === 'Rejected' ? 'error' : 'info',
    })
  }

  const handleOpenEdit = (field: ReviewableField) => {
    setEditingField(field)
    setEditValue(field.value)
    setEditDoctorNote(field.doctorNote || '')
  }

  const handleSaveFieldEdit = () => {
    if (!editingField) return
    setFields((prev) =>
      prev.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              value: editValue,
              doctorNote: editDoctorNote,
              decision: 'Verified',
            }
          : f
      )
    )
    setEditingField(null)
    toast({
      title: 'Physician Edit Applied',
      message: 'Field updated with physician clinical remarks and marked Verified.',
      type: 'success',
    })
  }

  // Master Verify Action
  const handleConfirmMasterVerification = () => {
    setIsOverallVerified(true)
    setVerifyModalOpen(false)
    // Automatically promote all pending fields to Verified
    setFields((prev) =>
      prev.map((f) => (f.decision === 'Needs review' ? { ...f, decision: 'Verified' } : f))
    )
    toast({
      title: 'Summary Verified & ABDM Signed',
      message: 'Summary approved by Dr. Anand Kulkarni (MD Ayu) and committed to ABDM EHR.',
      type: 'success',
    })
  }

  // Helper for Decision Badge
  const renderDecisionBadge = (decision: ReviewDecision) => {
    switch (decision) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-700" />
            Verified
          </span>
        )
      case 'Needs review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            Needs review
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
            <X className="w-3 h-3 text-rose-700" />
            Rejected
          </span>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Queue
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {patientData.name}
              </h1>
              <Badge variant="ayush" size="sm">
                Token {patientData.tokenNumber}
              </Badge>
              {isAnanya && (
                <Badge variant="saffron" size="sm">
                  Returning Patient
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ABHA: {patientData.abhaId} • Age: {patientData.age}Y • Gender: {patientData.gender}
            </p>
          </div>
        </div>

        {/* Master Verification Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOverallVerified ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="ayush"
                size="lg"
                className="bg-emerald-100 text-emerald-900 border-emerald-300 py-2 px-3 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />
                Verified & Signed by Dr. Anand Kulkarni
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOverallVerified(false)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Modify
              </Button>
            </div>
          ) : (
            <Button
              id="btn-verify-summary"
              variant="primary"
              size="lg"
              onClick={() => setVerifyModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
              className="shadow-sm"
            >
              Verify Summary
            </Button>
          )}
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">
            Professional Verification Notice
          </p>
          <p className="text-amber-800 leading-relaxed text-xs">
            AI-assisted information is provided as a draft for professional review. The healthcare
            professional remains responsible for clinical decisions. The doctor remains the final
            decision-maker.
          </p>
        </div>
      </div>

      {/* 1. Patient Profile Card */}
      <Card variant="default">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Patient Name</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{patientData.name}</p>
              <p className="text-slate-500">{patientData.age} Y • {patientData.gender}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">ABHA Identification</span>
              <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">{patientData.abhaId}</p>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ABDM Verified
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Visit Category</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {isAnanya ? 'Returning Patient' : 'New OPD Registration'}
              </p>
              <p className="text-slate-500">
                {isAnanya ? 'Previous: 15 Aug 2026' : 'First Intake'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Intake Kiosk & Terminal</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{patientData.kioskTerminal}</p>
              <p className="text-slate-500">{patientData.intakeTimestamp}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Overall Review Status</span>
              <div className="mt-1">
                {isOverallVerified ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Needs review
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Multi-Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Clinical History, Delta Changes, AYUSH, Jihva, Nadi, Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Clinical History */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ayush-primary" />
                  Clinical History
                </CardTitle>
                <Badge variant="outline" size="sm">
                  Conversationally Captured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {fields
                .filter((f) => f.section === 'Clinical History')
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveSourceField(field)}
                          className="text-[11px] text-ayush-primary hover:underline font-bold mr-2 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View source
                        </button>
                        {/* Doctor Decision Controls */}
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {field.value}
                    </p>
                    {field.doctorNote && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50 p-1.5 rounded border border-amber-200">
                        Doctor note: {field.doctorNote}
                      </p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* 3. Delta Changes (Returning Patient Comparison) */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ayush-primary" />
                    Delta Changes Since Previous Visit (15 August 2026)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Comparative tracking of symptoms and constitutional stability over time.
                  </CardDescription>
                </div>
                <Badge variant="saffron" size="sm">
                  Delta Tracking
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {fields
                .filter((f) => f.section === 'Delta Changes')
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveSourceField(field)}
                          className="text-[11px] text-ayush-primary hover:underline font-bold mr-2 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View source
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {field.value}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* 4. AYUSH Assessment */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-ayush-primary" />
                  AYUSH Pariksha (Prakriti, Agni & Kostha)
                </CardTitle>
                <Badge variant="ayush" size="sm">
                  NAMASTE Aligned
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {fields
                .filter((f) => f.section === 'AYUSH Assessment')
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveSourceField(field)}
                          className="text-[11px] text-ayush-primary hover:underline font-bold mr-2 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View source
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {field.value}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* 5 & 6. Jihva & Nadi side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jihva Card */}
            <Card variant="default">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    👅 Jihva Assessment
                  </CardTitle>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Quality: Good
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {fields
                  .filter((f) => f.section === 'Jihva Assessment')
                  .map((field) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">{field.value}</p>
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Nadi Card */}
            <Card variant="default">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    🫀 Nadi Assessment
                  </CardTitle>
                  <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    PPG Sensor
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {fields
                  .filter((f) => f.section === 'Nadi Assessment')
                  .map((field) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">{field.value}</p>
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* 7. Documents & Medications */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-ayush-primary" />
                  Documents & Parsed Lab Data
                </CardTitle>
                <Badge variant="outline" size="sm">
                  OCR Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{doc.title}</span>
                      <span className="text-[10px] text-slate-500">{doc.date}</span>
                    </div>
                    <p className="text-slate-700 font-medium mt-1">{doc.extractedFinding}</p>
                  </div>
                ))}
              </div>

              {fields
                .filter((f) => f.section === 'Documents & Medications')
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 mt-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{field.label}</span>
                        {renderDecisionBadge(field.decision)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Verified')}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(field.id, 'Rejected')}
                          className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300 font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{field.value}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: AI Summary, Clinical Coding, Red Flags, Master Verify */}
        <div className="space-y-6">
          {/* 8. AI Diagnostic Impression & Rationale */}
          <Card variant="highlight" className="border-ayush-primary/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    AI Diagnostic Summary (Draft)
                  </CardTitle>
                </div>
                <Badge variant="saffron" size="sm">
                  Draft
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4 text-xs">
              {fields
                .filter((f) => f.section === 'AI Diagnostic Summary')
                .map((field) => (
                  <div
                    key={field.id}
                    className="p-3 bg-white rounded-xl border border-ayush-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{field.label}</span>
                      {renderDecisionBadge(field.decision)}
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{field.value}</p>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDecision(field.id, 'Verified')}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(field)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(field.id, 'Rejected')}
                        className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}

              {/* Master Verification Action in Card */}
              <div className="pt-2 space-y-2">
                <Button
                  variant={isOverallVerified ? 'secondary' : 'primary'}
                  size="lg"
                  onClick={() => setVerifyModalOpen(true)}
                  className="w-full"
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                >
                  {isOverallVerified ? 'Summary Verified (Update)' : 'Verify Summary'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 9. Clinical Coding (NAMASTE & ICD-11 TM2) */}
          <Card variant="default">
            <CardHeader className="pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-ayush-primary" />
                  Clinical Coding
                </CardTitle>
                <Badge variant="outline" size="sm">
                  DEMO Mappings
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Demonstration mapping:</strong> final coding requires professional validation.
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Janu Sandhivata</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-ayush-primary font-bold">NAM-AYU-OSS-041</span>
                    <span className="font-mono text-sky-800 font-bold">ICD-11: FA00.Z / TM2: SA-52</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Shirashoola (Vataja)</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-ayush-primary font-bold">NAM-AYU-SHI-012</span>
                    <span className="font-mono text-sky-800 font-bold">ICD-11: 8A80.0 / TM2: HE-18</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Mandagni / Sluggish Digestion</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-ayush-primary font-bold">NAM-AYU-DIG-019</span>
                    <span className="font-mono text-sky-800 font-bold">ICD-11: MD12.0 / TM2: DA-14</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Red Flags Card */}
          <Card variant="default">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                Red Flags Triage Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Audit Status: Clear
                </span>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  {patientData.history.redFlagAudit}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify Summary Confirmation Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Physician Clinical Verification & Sign-off"
        description="Review and commit this clinical intake summary into the ABDM Electronic Health Record."
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">
                Patient: {patientData.name} ({patientData.age}Y • {patientData.gender})
              </span>
              <Badge variant="ayush">Token {patientData.tokenNumber}</Badge>
            </div>
            <p className="text-slate-600">
              ABHA: {patientData.abhaId} • Intake Terminal: {patientData.kioskTerminal}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 leading-relaxed text-xs">
            <strong>Physician Declaration:</strong> I, Dr. Anand Kulkarni (MD Ayu), certify that I
            have examined the AI-assisted intake draft, cross-verified the history, Jihva, Nadi, and
            investigations, and approve this clinical summary for official outpatient care. The doctor
            remains the final decision-maker.
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Verification Summary:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                {fields.filter((f) => f.decision === 'Verified').length} Verified
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                {fields.filter((f) => f.decision === 'Needs review').length} Needs Review
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-bold">
                {fields.filter((f) => f.decision === 'Rejected').length} Rejected
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setVerifyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmMasterVerification}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve & Sign Summary
            </Button>
          </div>
        </div>
      </Modal>

      {/* Field Edit Modal */}
      {editingField && (
        <Modal
          isOpen={Boolean(editingField)}
          onClose={() => setEditingField(null)}
          title={`Edit Clinical Parameter: ${editingField.label}`}
          description="Override or refine the AI-generated parameter before clinical sign-off."
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Clinical Value:</label>
              <textarea
                rows={3}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-xs font-medium p-3 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-ayush-primary"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Physician Clinical Remarks / Note:</label>
              <input
                type="text"
                placeholder="Optional clinical rationale for modification..."
                value={editDoctorNote}
                onChange={(e) => setEditDoctorNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-ayush-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveFieldEdit}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Save & Verify
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Source Modal */}
      {activeSourceField && (
        <Modal
          isOpen={Boolean(activeSourceField)}
          onClose={() => setActiveSourceField(null)}
          title="Clinical Traceability Source"
          description="Origin evidence and audit log for clinical intake parameter."
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Parameter:</span>
              <p className="font-bold text-slate-900 text-sm">{activeSourceField.label}</p>
              <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                "{activeSourceField.value}"
              </p>
            </div>

            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-1 text-sky-950">
              <span className="font-bold block text-[11px] uppercase tracking-wider text-sky-900">
                Source Attribution:
              </span>
              <p className="text-xs text-sky-900 leading-relaxed">
                {activeSourceField.source}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-semibold">Extraction Confidence:</span>
              <span className="font-bold text-slate-800">{activeSourceField.confidence}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSourceField(null)}
              >
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
