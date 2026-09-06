import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Edit3,
  Check,
  X,
  Languages,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  FileSearch,
  Eye,
  Stethoscope,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useTranslation, TRANSLATIONS, type SupportedLanguage } from '@/translations'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'
export type FieldStatus = 'draft' | 'verified' | 'rejected' | 'edited'

export interface SummaryField {
  id: string
  label: string
  labelHi?: string
  value: string
  valueHi?: string
  confidence: ConfidenceLevel
  source: 'Patient response' | 'Uploaded document' | 'Caregiver response' | 'Simulated AI extraction'
  sourceDetail: string
  section: string
  status: FieldStatus
  originalValue?: string
}

interface CodingItem {
  ayushTerm: string
  namasteCode: string
  icd11Tm2: string
  description: string
  confidence: ConfidenceLevel
}

const INITIAL_FIELDS: SummaryField[] = [
  // Patient info
  {
    id: 'f-name',
    label: 'Patient Full Name',
    labelHi: 'रोगी का नाम',
    value: 'Ananya Krishnan',
    valueHi: 'अनन्या कृष्णन',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'ABHA Registry verified record & verified biometric check-in.',
    section: 'Patient Information',
    status: 'draft',
  },
  {
    id: 'f-demographics',
    label: 'Demographics & Visit Status',
    labelHi: 'जनसांख्यिकी और यात्रा स्थिति',
    value: '42 Y / Female • Returning Patient (Previous: 15 Aug 2026)',
    valueHi: '42 वर्ष / महिला • पुनरागमन रोगी (पिछली भेंट: 15 अगस्त 2026)',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Electronic Health Record (EHR) cross-referenced at kiosk intake.',
    section: 'Patient Information',
    status: 'draft',
  },
  {
    id: 'f-abha',
    label: 'ABHA Identification Number',
    labelHi: 'आयुष्मान भारत स्वास्थ्य खाता (ABHA)',
    value: 'XX-XXXX-XXXX-4821 (ABDM Linked)',
    valueHi: 'XX-XXXX-XXXX-4821 (एबीडीएम लिंक)',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'National Health Authority ABDM M1/M2 sandbox authentication.',
    section: 'Patient Information',
    status: 'draft',
  },

  // Chief concern
  {
    id: 'f-chief-concern',
    label: 'Chief Complaint & Primary Concern',
    labelHi: 'मुख्य समस्या और शिकायत',
    value: 'Headache & right knee stiffness',
    valueHi: 'सिरदर्द और दाएं घुटने में जकड़न (3 माह से)',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Patient response during conversational intake history step.',
    section: 'Chief Concern',
    status: 'draft',
  },
  {
    id: 'f-duration',
    label: 'Onset & Chronological Duration',
    labelHi: 'लक्षण अवधि',
    value: '3 months duration, aggravated in morning and rainy weather',
    valueHi: '3 महीने, सुबह और नम/ठंडे मौसम में बढ़ती है',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Patient voice and interactive touch confirmation in Step 4.',
    section: 'Chief Concern',
    status: 'draft',
  },

  // Clinical history
  {
    id: 'f-pain-char',
    label: 'Symptom Character & Crepitus',
    labelHi: 'लक्षण स्वरूप और संधि ध्वनि',
    value: 'Dull aching pain with crepitus on knee flexion; morning stiffness 25 min',
    valueHi: 'घुटने मोड़ने पर कट-कट की आवाज और 25 मिनट सुबह जकड़न',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Patient response during conversational symptom assessment.',
    section: 'Clinical History',
    status: 'draft',
  },
  {
    id: 'f-aggravating',
    label: 'Aggravating Factors',
    labelHi: 'रोग बढ़ाने वाले कारक',
    value: 'Cold weather, prolonged standing, late-night working, irregular meals',
    valueHi: 'ठंड, देर तक खड़े रहना, देर रात जागना, अनियमित भोजन',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Patient history questionnaire checklist.',
    section: 'Clinical History',
    status: 'draft',
  },
  {
    id: 'f-relieving',
    label: 'Relieving Factors',
    labelHi: 'राहत देने वाले कारक',
    value: 'Warm sesame oil application (Til Taila), warm bath, restful sleep',
    valueHi: 'तिल तेल की मालिश, गर्म पानी से स्नान, पर्याप्त विश्राम',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Patient response during clinical intake.',
    section: 'Clinical History',
    status: 'draft',
  },

  // AYUSH Assessment
  {
    id: 'f-prakriti',
    label: 'Dominant Prakriti (Constitutional Baseline)',
    labelHi: 'मूल प्रकृति',
    value: 'Pitta-Kapha baseline with secondary Vata Vikriti',
    valueHi: 'पित्त-कफ मूल प्रकृति, वात प्रकोप (विकृति)',
    confidence: 'High',
    source: 'Simulated AI extraction',
    sourceDetail: 'AYUSH standardized questionnaire algorithm combined with prior visit baseline.',
    section: 'AYUSH Assessment',
    status: 'draft',
  },
  {
    id: 'f-agni',
    label: 'Agni (Digestive Fire Status)',
    labelHi: 'अग्नि स्थिति (पाचन क्षमता)',
    value: 'Vishama Agni (Irregular digestive fire with post-prandial bloating)',
    valueHi: 'विषम अग्नि (अनियमित पाचन और भोजन के बाद भारीपन)',
    confidence: 'Medium',
    source: 'Patient response',
    sourceDetail: 'Patient self-reported appetite and bowel regularity.',
    section: 'AYUSH Assessment',
    status: 'draft',
  },
  {
    id: 'f-kostha',
    label: 'Kostha & Bowel Pattern',
    labelHi: 'कोष्ठ एवं मल प्रवृत्ति',
    value: 'Madhyama Kostha (Moderate bowel evacuation with tendency to dryness)',
    valueHi: 'मध्यम कोष्ठ (मल त्याग सामान्य किन्तु रुक्षता की प्रवृत्ति)',
    confidence: 'Medium',
    source: 'Patient response',
    sourceDetail: 'Patient response in AYUSH intake step.',
    section: 'AYUSH Assessment',
    status: 'draft',
  },

  // Jihva
  {
    id: 'f-jihva-coating',
    label: 'Jihva Pariksha (Tongue Coating & Ama)',
    labelHi: 'जिह्वा परीक्षा (लेप एवं आम लक्षण)',
    value: 'Moderate white coating at posterior 1/3rd (Indicates colon Ama/toxins)',
    valueHi: 'जिह्वा के पिछले भाग पर सफेद लेप (आम संचय का सूचक)',
    confidence: 'High',
    source: 'Simulated AI extraction',
    sourceDetail: 'Optical image capture evaluated by standardized computer vision model.',
    section: 'Jihva Assessment',
    status: 'draft',
  },
  {
    id: 'f-jihva-surface',
    label: 'Tongue Surface & Edge Morphology',
    labelHi: 'जिह्वा सतह एवं किनारे',
    value: 'Dry surface with micro-fissures, mild lateral teeth indentations',
    valueHi: 'रुक्ष सतह, हल्की दरारें, किनारों पर दांतों के निशान',
    confidence: 'Medium',
    source: 'Simulated AI extraction',
    sourceDetail: 'Optical camera sensor analysis in Step 6.',
    section: 'Jihva Assessment',
    status: 'draft',
  },

  // Nadi
  {
    id: 'f-nadi-rate',
    label: 'Nadi Heart Rate & Regularity',
    labelHi: 'नाड़ी गति (हृदय गति)',
    value: '74 BPM (Regular rhythm, Madhyama Vega)',
    valueHi: '74 स्पंदन/मिनट (नियमित लय, मध्यम वेग)',
    confidence: 'High',
    source: 'Simulated AI extraction',
    sourceDetail: 'Supplementary digital PPG pulse sensor real-time stream.',
    section: 'Nadi Assessment',
    status: 'draft',
  },
  {
    id: 'f-nadi-gati',
    label: 'Doshic Gati (Pulse Waveform Classification)',
    labelHi: 'दोषज गति',
    value: 'Sarpa Gati (Serpentine movement indicating Vata predominance)',
    valueHi: 'सर्प गति (नागवत् गति, वात प्रधानता का संकेत)',
    confidence: 'Medium',
    source: 'Simulated AI extraction',
    sourceDetail: 'Spectral waveform analysis of photoplethysmogram curve.',
    section: 'Nadi Assessment',
    status: 'draft',
  },

  // Documents
  {
    id: 'f-docs-esr',
    label: 'Laboratory Marker: ESR',
    labelHi: 'प्रयोगशाला जांच: ईएसआर',
    value: 'ESR: 38 mm/hr (Elevated / Abnormal; Ref: 0–20 mm/hr)',
    valueHi: 'ईएसआर: 38 मिमी/घंटा (उच्च / असामान्य)',
    confidence: 'High',
    source: 'Uploaded document',
    sourceDetail: 'SRL Diagnostic Lab report scanned and parsed via simulated OCR.',
    section: 'Documents',
    status: 'draft',
  },
  {
    id: 'f-docs-uric',
    label: 'Laboratory Marker: Serum Uric Acid',
    labelHi: 'सीरम यूरिक एसिड',
    value: 'Serum Uric Acid: 7.2 mg/dL (Elevated; Ref: 2.6–6.0 mg/dL)',
    valueHi: 'सीरम यूरिक एसिड: 7.2 मिलीग्राम/डेसीलीटर (उच्च)',
    confidence: 'High',
    source: 'Uploaded document',
    sourceDetail: 'SRL Diagnostic Lab report scanned and parsed via simulated OCR.',
    section: 'Documents',
    status: 'draft',
  },

  // Current medications
  {
    id: 'f-med-yogaraja',
    label: 'Prescribed Classical Formulation',
    labelHi: 'आयुर्वेदिक औषधि',
    value: 'Yogaraja Guggulu 2 tablets BD with warm water',
    valueHi: 'योगराज गुग्गुलु 2 गोली दिन में दो बार गुनगुने पानी से',
    confidence: 'High',
    source: 'Uploaded document',
    sourceDetail: 'Extracted from AIIA Outpatient prescription slip dated 12 Aug 2026.',
    section: 'Current Medications',
    status: 'draft',
  },
  {
    id: 'f-med-dashamoola',
    label: 'Prescribed Decoction',
    labelHi: 'कषायम्',
    value: 'Dashamoola Kashayam 15 ml BD with 45 ml lukewarm water',
    valueHi: 'दशमूल कषायम् 15 मिली समभाग गुनगुने पानी के साथ',
    confidence: 'High',
    source: 'Uploaded document',
    sourceDetail: 'Extracted from AIIA Outpatient prescription slip.',
    section: 'Current Medications',
    status: 'draft',
  },
  {
    id: 'f-med-aceclo',
    label: 'Allopathic NSAID (SOS)',
    labelHi: 'दर्द निवारक औषधि (आवश्यकतानुसार)',
    value: 'Aceclofenac 100 mg 1 tablet SOS for acute pain flare-ups',
    valueHi: 'एसेक्लोफेनाक 100 मिग्रा - तीव्र दर्द में आवश्यकतानुसार',
    confidence: 'Medium',
    source: 'Uploaded document',
    sourceDetail: 'Extracted from prescription slip; drug interaction alert triggered.',
    section: 'Current Medications',
    status: 'draft',
  },
  {
    id: 'f-med-unknown',
    label: 'Over-the-Counter / Unverified Formulation',
    labelHi: 'अन्य अनौपचारिक औषधियां',
    value: 'Unlabeled herbal joint balm purchased locally',
    valueHi: 'स्थानीय स्तर पर खरीदा गया हर्बल लेप (अज्ञात घटक)',
    confidence: 'Low',
    source: 'Patient response',
    sourceDetail: 'Verbal patient mention without manufacturer packaging or batch label.',
    section: 'Current Medications',
    status: 'draft',
  },

  // Red Flags
  {
    id: 'f-redflag-status',
    label: 'Red Flag & Emergency Triage Evaluation',
    labelHi: 'आपातकालीन खतरे के लक्षण',
    value: 'Clear — No acute red-flag conditions detected (No chest pain, dyspnea, joint infection signs)',
    valueHi: 'सुरक्षित — कोई आपातकालीन लक्षण नहीं पाए गए',
    confidence: 'High',
    source: 'Simulated AI extraction',
    sourceDetail: 'Rule-based emergency checklist evaluated at Step 4.',
    section: 'Red Flags',
    status: 'draft',
  },

  // Changes since previous visit
  {
    id: 'f-delta-sleep',
    label: 'Sleep Duration & Pattern Change',
    labelHi: 'नींद में परिवर्तन',
    value: 'Sleep: 6 hours → 5 hours with occasional night waking (Changed since 15 August 2026 visit)',
    valueHi: 'नींद: 6 घंटे → 5 घंटे (15 अगस्त 2026 की भेंट के बाद से कम)',
    confidence: 'Medium',
    source: 'Patient response',
    sourceDetail: 'Delta mode comparative questions answered by returning patient.',
    section: 'Changes Since Previous Visit',
    status: 'draft',
  },
  {
    id: 'f-delta-health',
    label: 'General Health Progression',
    labelHi: 'सामान्य स्वास्थ्य में बदलाव',
    value: 'Changed — New concern: Headache with right knee morning stiffness',
    valueHi: 'परिवर्तित — नई समस्या: सिरदर्द एवं दाएं घुटने में प्रातःकालीन जकड़न',
    confidence: 'High',
    source: 'Patient response',
    sourceDetail: 'Delta mode comparative questions answered by returning patient.',
    section: 'Changes Since Previous Visit',
    status: 'draft',
  },
]

const DEMO_CODINGS: CodingItem[] = [
  {
    ayushTerm: 'Janu Sandhivata (Osteoarthritis of Knee)',
    namasteCode: 'NAM-AYU-OSS-041',
    icd11Tm2: 'FA00.Z / TM2: SA-52',
    description: 'Degenerative joint disorder of Janu Sandhi characterized by Shoola, Shotha, and Vata vriddhi.',
    confidence: 'High',
  },
  {
    ayushTerm: 'Shirashoola / Vataja Shiroroga (Tension Headache)',
    namasteCode: 'NAM-AYU-SHI-012',
    icd11Tm2: '8A80.0 / TM2: HE-18',
    description: 'Headache triggered by Vata aggravation, irregular sleep cycles, and mental exhaustion.',
    confidence: 'Medium',
  },
  {
    ayushTerm: 'Mandagni & Kostha Gaurava (Sluggish Digestion)',
    namasteCode: 'NAM-AYU-DIG-019',
    icd11Tm2: 'MD12.0 / TM2: DA-14',
    description: 'Impaired digestive capacity resulting in delayed metabolism and mild posterior tongue coating.',
    confidence: 'High',
  },
  {
    ayushTerm: 'Pitta-Kapha Prakriti with Vata Vikriti',
    namasteCode: 'NAM-AYU-DOS-006',
    icd11Tm2: 'TM2-DOSHA-PK-V',
    description: 'Constitutional bio-typology baseline with secondary kinetic (Vata) disturbance.',
    confidence: 'High',
  },
]

export function StepSummary() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session } = usePatientSession()
  const { currentLang } = useTranslation()

  // State - default to session language
  const [fields, setFields] = useState<SummaryField[]>(INITIAL_FIELDS)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (session.selectedLanguage as SupportedLanguage) || (currentLang as SupportedLanguage) || 'en'
  )
  const [isBilingualView, setIsBilingualView] = useState(false)
  const [activeSourceModal, setActiveSourceModal] = useState<SummaryField | null>(null)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editTempValue, setEditTempValue] = useState('')
  const [codingConfirmed, setCodingConfirmed] = useState<Record<string, boolean>>({
    'NAM-AYU-OSS-041': true,
    'NAM-AYU-SHI-012': true,
  })

  // Active translation dictionary
  const activeT = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['en']
  const englishT = TRANSLATIONS['en']

  // Available languages for summary toggle
  const availableSummaryLangs: { id: SupportedLanguage; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिन्दी (Hindi)' },
  ]
  if (session.selectedLanguage && session.selectedLanguage !== 'en' && session.selectedLanguage !== 'hi') {
    availableSummaryLangs.push({
      id: session.selectedLanguage as SupportedLanguage,
      label: session.selectedLanguageName || session.selectedLanguage.toUpperCase(),
    })
  }

  // Filter sections
  const sections = Array.from(new Set(fields.map((f) => f.section)))

  // Handle Edit
  const handleStartEdit = (field: SummaryField) => {
    setEditingFieldId(field.id)
    setEditTempValue(field.value)
  }

  const handleSaveEdit = (id: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            originalValue: f.originalValue || f.value,
            value: editTempValue,
            status: 'edited',
          }
        }
        return f
      })
    )
    setEditingFieldId(null)
    toast({
      title: 'Field Updated',
      message: 'Your correction has been saved to the clinical intake draft.',
      type: 'success',
    })
  }

  const handleRejectField = (id: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status: 'rejected',
          }
        }
        return f
      })
    )
    setEditingFieldId(null)
    toast({
      title: 'Field Marked as Rejected',
      message: 'Field flagged as inaccurate for physician reassessment.',
      type: 'warning',
    })
  }

  const handleRestoreField = (id: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status: 'draft',
            value: f.originalValue || f.value,
          }
        }
        return f
      })
    )
    toast({
      title: 'Field Restored',
      message: 'Field restored to original draft state.',
      type: 'info',
    })
  }

  // Helper for confidence badge
  const renderConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {`High ${activeT.common?.confidence || 'confidence'}`}
          </span>
        )
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            {`Medium ${activeT.common?.confidence || 'confidence'}`}
          </span>
        )
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            {`Low ${activeT.common?.confidence || 'confidence'}`}
          </span>
        )
    }
  }

  const renderStatusBadge = (status: FieldStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
            <Check className="w-3 h-3 text-emerald-700" /> Verified
          </span>
        )
      case 'edited':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900">
            <Edit3 className="w-3 h-3 text-sky-700" /> Edited by Patient
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900">
            <X className="w-3 h-3 text-rose-700" /> Rejected
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Draft
          </span>
        )
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="ayush">
              {activeT.common?.stepOf ? activeT.common.stepOf(9, 10) : 'Step 9 of 10'} • {activeT.summary?.title || 'Clinical Summary'}
            </Badge>
            <Badge variant="saffron">Physician Verification Draft</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {activeT.summary?.title || 'Clinical Summary'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {activeT.summary?.subtitle || 'Review the information captured during your assessment.'}
          </p>
        </div>

        {/* Bilingual & Language Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs text-xs">
            <span className="px-2 text-slate-500 font-medium flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              Language:
            </span>
            {availableSummaryLangs.map((l) => (
              <button
                key={l.id}
                type="button"
                id={`lang-btn-${l.id}`}
                onClick={() => setSelectedLanguage(l.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedLanguage === l.id
                    ? 'bg-ayush-primary text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            id="btn-toggle-bilingual-view"
            variant={isBilingualView ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setIsBilingualView(!isBilingualView)
              toast({
                title: isBilingualView ? 'Standard View Active' : 'Bilingual View Enabled',
                message: isBilingualView
                  ? 'Switched to primary language view.'
                  : `Showing English and ${activeT.langName} clinical translations side-by-side.`,
                type: 'info',
              })
            }}
            leftIcon={<Languages className="w-4 h-4" />}
          >
            {isBilingualView ? 'Bilingual view active' : (activeT.summary?.bilingualToggle || 'Generate bilingual view')}
          </Button>
        </div>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            {activeT.common?.aiDraftDisclaimer || 'AI-generated draft — requires professional verification.'}
          </p>
          <p className="text-amber-800 leading-relaxed text-xs">
            {activeT.common?.autonomousDisclaimer || 'AI does not make an autonomous diagnosis. Final clinical decisions remain with the qualified healthcare professional.'}
          </p>
        </div>
      </div>

      {/* Structured Sections Loop */}
      <div className="space-y-5">
        {sections.map((sectionName) => {
          const sectionFields = fields.filter((f) => f.section === sectionName)
          const localizedSectionName = activeT.summary?.sections?.[sectionName] || sectionName

          return (
            <Card key={sectionName} variant="default" className="border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ayush-primary" />
                    {localizedSectionName}
                  </CardTitle>
                  <span className="text-xs text-slate-500 font-medium">
                    {sectionFields.length} {sectionFields.length === 1 ? 'Field' : 'Fields'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
                {sectionFields.map((field) => {
                  const isEditing = editingFieldId === field.id
                  const isRejected = field.status === 'rejected'
                  const localizedField = activeT.summary?.fields?.[field.id]
                  const englishField = englishT.summary?.fields?.[field.id]

                  const displayLabel = localizedField?.label || (selectedLanguage === 'hi' && field.labelHi ? field.labelHi : field.label)
                  const displayValue = field.status === 'edited'
                    ? field.value
                    : (localizedField?.value || (selectedLanguage === 'hi' && field.valueHi ? field.valueHi : field.value))

                  const englishLabel = englishField?.label || field.label
                  const englishValue = englishField?.value || field.value

                  return (
                    <div
                      key={field.id}
                      className={`pt-3.5 first:pt-0 ${
                        isRejected ? 'opacity-60 bg-rose-50/30 p-3 rounded-xl' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        {/* Field Label & Subtitle */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{displayLabel}</h4>
                            {renderConfidenceBadge(field.confidence)}
                            {renderStatusBadge(field.status)}
                          </div>
                          {isBilingualView && selectedLanguage !== 'en' && (
                            <p className="text-xs text-slate-500 font-medium">
                              English: {englishLabel}
                            </p>
                          )}
                        </div>

                        {/* Right: Traceability Trigger */}
                        <button
                          type="button"
                          onClick={() => setActiveSourceModal(field)}
                          className="text-xs text-ayush-primary hover:text-ayush-dark hover:underline font-bold flex items-center gap-1 self-start shrink-0 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View source
                        </button>
                      </div>

                      {/* Field Value Display OR Edit Mode */}
                      <div className="mt-2 text-sm">
                        {isEditing ? (
                          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-300">
                            <label className="text-xs font-bold text-slate-700 block">
                              Edit value for: {displayLabel}
                            </label>
                            <input
                              type="text"
                              value={editTempValue}
                              onChange={(e) => setEditTempValue(e.target.value)}
                              className="w-full text-sm font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-ayush-primary"
                            />
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleSaveEdit(field.id)}
                                leftIcon={<Check className="w-3.5 h-3.5" />}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingFieldId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRejectField(field.id)}
                                leftIcon={<X className="w-3.5 h-3.5" />}
                              >
                                Reject field
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p
                                className={`text-slate-800 font-medium leading-relaxed ${
                                  isRejected ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {displayValue}
                              </p>

                              {/* Action Buttons: Edit, Save, Reject */}
                              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                                {isRejected ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRestoreField(field.id)}
                                  >
                                    Restore
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleStartEdit(field)}
                                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-600" />}
                                      className="text-xs text-slate-700"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRejectField(field.id)}
                                      leftIcon={<X className="w-3.5 h-3.5 text-rose-600" />}
                                      className="text-xs text-rose-700 hover:bg-rose-50"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Bilingual Sub-Value */}
                            {isBilingualView && selectedLanguage !== 'en' && (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 mt-1">
                                <span className="font-semibold text-slate-500 mr-1.5">
                                  English Reference:
                                </span>
                                {englishValue}
                              </div>
                            )}

                            {field.originalValue && (
                              <p className="text-[11px] text-slate-400 italic">
                                Original: {field.originalValue}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Clinical Coding Section: NAMASTE & ICD-11 TM2 */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-3 bg-slate-50/60 rounded-t-2xl border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-ayush-primary" />
                  Clinical Coding (NAMASTE & ICD-11 TM2)
                </CardTitle>
                <Badge variant="saffron">DEMO Mappings</Badge>
              </div>
              <CardDescription className="mt-1">
                Standardized interoperability cross-walk between National AYUSH Morbidity Codes (NAMASTE) and WHO ICD-11 Traditional Medicine Module 2 (TM2).
              </CardDescription>
            </div>

            <Badge variant="outline" className="self-start sm:self-auto font-mono text-[11px]">
              WHO ICD-11 TM2 Aligned
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Explicit Demonstration Label Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                Demonstration mapping — final coding requires professional validation.
              </strong>
              <p className="mt-0.5 text-amber-800">
                Codes shown below are demo sample mappings generated for clinical decision support. The licensed AYUSH clinician must confirm and sign off all official electronic health record diagnostic codes.
              </p>
            </div>
          </div>

          {/* Coding Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-semibold">
                  <th className="py-2.5 px-3">AYUSH Term / Clinical Concept</th>
                  <th className="py-2.5 px-3">NAMASTE Code</th>
                  <th className="py-2.5 px-3">ICD-11 TM2 Equivalent</th>
                  <th className="py-2.5 px-3">Clinical Description</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_CODINGS.map((coding) => {
                  const isAccepted = codingConfirmed[coding.namasteCode]

                  return (
                    <tr key={coding.namasteCode} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {coding.ayushTerm}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-ayush-primary">
                        {coding.namasteCode}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sky-800">
                        {coding.icd11Tm2}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs leading-relaxed">
                        {coding.description}
                      </td>
                      <td className="py-3 px-3">
                        {renderConfidenceBadge(coding.confidence)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCodingConfirmed((prev) => ({
                              ...prev,
                              [coding.namasteCode]: !prev[coding.namasteCode],
                            }))
                            toast({
                              title: !isAccepted ? 'Code Accepted' : 'Code Pending Review',
                              message: `${coding.namasteCode} ${!isAccepted ? 'accepted into draft' : 'flagged for reassessment'}.`,
                              type: 'info',
                            })
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isAccepted ? 'Accepted' : 'Needs Review'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate('/patient/documents')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {activeT.common?.back || 'Previous Step'}: {activeT.stepper?.documents?.title || 'Documents'}
        </Button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Quick link to doctor portal to test verification flow */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              toast({
                title: 'Opening Doctor Review Portal',
                message: 'Viewing patient draft in physician dashboard.',
                type: 'info',
              })
              navigate('/doctor/patient/pat-ananya')
            }}
            leftIcon={<Stethoscope className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Review in Doctor Portal
          </Button>

          <Button
            type="button"
            id="btn-generate-consultation-token"
            variant="primary"
            size="lg"
            onClick={() => {
              toast({
                title: 'Clinical Summary Confirmed',
                message: 'All intake parameters compiled. Generating consultation pass.',
                type: 'success',
              })
              navigate('/patient/token')
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-sm"
          >
            {activeT.summary?.confirmAndSubmit || 'Generate Consultation Token'}
          </Button>
        </div>
      </div>

      {/* Traceability "View source" Modal */}
      {activeSourceModal && (
        <Modal
          isOpen={Boolean(activeSourceModal)}
          onClose={() => setActiveSourceModal(null)}
          title="Clinical Traceability Source"
          description="Detailed audit trail of where and how this clinical parameter was captured."
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target Field:
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {activeSourceModal.label}
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium">
                "{activeSourceModal.value}"
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-semibold">Primary Source Category:</span>
                <span className="font-bold text-slate-900 px-2.5 py-1 rounded-md bg-white border border-slate-300">
                  {activeSourceModal.source}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-semibold">Extraction Confidence:</span>
                <div>{renderConfidenceBadge(activeSourceModal.confidence)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1 text-sky-950">
                <span className="font-bold block flex items-center gap-1 text-[11px] uppercase tracking-wider text-sky-900">
                  <FileSearch className="w-3.5 h-3.5 text-sky-700" />
                  Source Evidence & Audit Log:
                </span>
                <p className="text-xs text-sky-900 leading-relaxed">
                  {activeSourceModal.sourceDetail}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSourceModal(null)}
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
