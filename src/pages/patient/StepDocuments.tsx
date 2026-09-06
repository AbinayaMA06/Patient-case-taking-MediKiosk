import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  User,
  Pill,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldAlert,
  FileSearch,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useTranslation } from '@/translations'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'processed'

interface TimelineItem {
  id: string
  date: string
  title: string
  type: 'Current assessment' | 'Previous visit' | 'Prescription' | 'Uploaded lab report'
  badgeVariant: 'ayush' | 'saffron' | 'default' | 'outline'
  facility: string
  clinician?: string
  summary: string
  details: {
    findings: string[]
    medications?: string[]
    labValues?: { test: string; result: string; refRange: string; isAbnormal?: boolean }[]
    notes: string
  }
}

const INITIAL_TIMELINE: TimelineItem[] = [
  {
    id: 'tl-current',
    date: 'Today • 05 Sep 2026',
    title: 'Current Intake Assessment',
    type: 'Current assessment',
    badgeVariant: 'ayush',
    facility: 'MediKiosk Terminal #4 • Central AYUSH Hospital',
    clinician: 'Automated Clinical Triage & Intake',
    summary: 'Delta mode intake completed, Jihva posterior coating recorded, Nadi rate 74 BPM.',
    details: {
      findings: [
        'Chief Concern: Recurring right knee stiffness & occasional morning headache',
        'Delta Status: Sleep reduced to 5 hours (Changed), mild dietary changes',
        'Jihva Pariksha: Moderate white posterior coating (Ama), mild lateral erythema',
        'Nadi Pariksha: 74 BPM, Sarpa Gati (Vata-dominant), signal quality Good',
      ],
      notes: 'All biometric and conversational inputs ready for physician verification.',
    },
  },
  {
    id: 'tl-prev-visit',
    date: '15 August 2026',
    title: 'Previous OPD Consultation',
    type: 'Previous visit',
    badgeVariant: 'default',
    facility: 'Central AYUSH Hospital • OPD Room 14',
    clinician: 'Dr. Anand Kulkarni, MD (Ayur)',
    summary: 'Clinical consultation for Sandhivata baseline and Mandagni (sluggish digestive fire).',
    details: {
      findings: [
        'Clinical diagnosis: Sandhigata Vata (Early osteoarthritis changes)',
        'Prakriti confirmed: Pitta-Kapha baseline',
        'Agni status: Vishama (irregular digestive fire)',
      ],
      medications: [
        'Yogaraja Guggulu 2 tabs BD with warm water',
        'Dashamoola Kashayam 15 ml BD with 45 ml lukewarm water',
      ],
      notes: 'Patient advised to repeat ESR & Serum Uric acid if joint swelling persisted.',
    },
  },
  {
    id: 'tl-prescription',
    date: '15 August 2026',
    title: 'Outpatient Prescription Slip',
    type: 'Prescription',
    badgeVariant: 'saffron',
    facility: 'All India Institute of Ayurveda (AIIA) OPD, New Delhi',
    clinician: 'Dr. Ramesh Chandra, MD (Ayur), Senior Consultant',
    summary: 'Prescribed Ayurvedic formulation regimen and SOS analgesic advisory.',
    details: {
      findings: [
        'Prescription ID: AIIA-OPD-2026-89421',
        'Diagnosis: Janu Sandhivata & Grudhrasi lakshana',
      ],
      medications: [
        'Yogaraja Guggulu — 2 tablets BD after meals (Confidence: Medium)',
        'Dashamoola Kashayam — 15 ml BD with lukewarm water (Confidence: Medium)',
        'Aceclofenac 100 mg — 1 tab SOS for severe inflammatory flare-ups (Confidence: Medium)',
      ],
      notes: 'Take Ayurvedic medicines with warm water. Avoid sour, fermented foods (Amla / Vidahi ahara).',
    },
  },
  {
    id: 'tl-lab-report',
    date: '12 August 2026',
    title: 'Diagnostic Laboratory Report',
    type: 'Uploaded lab report',
    badgeVariant: 'outline',
    facility: 'SRL Diagnostic Laboratories • Central Reference Lab',
    clinician: 'Dr. Meera Swaminathan, MD (Pathology)',
    summary: 'Inflammatory and metabolic profile: elevated ESR and Serum Uric Acid.',
    details: {
      findings: [
        'Sample type: Venous whole blood & serum',
        'Sample collection: 12 Aug 2026, 08:30 AM (Fasting)',
      ],
      labValues: [
        { test: 'Erythrocyte Sedimentation Rate (ESR)', result: '38 mm/hr', refRange: '0–20 mm/hr', isAbnormal: true },
        { test: 'Serum Uric Acid', result: '7.2 mg/dL', refRange: '2.6–6.0 mg/dL', isAbnormal: true },
        { test: 'Hemoglobin (Hb)', result: '12.8 g/dL', refRange: '12.0–15.5 g/dL', isAbnormal: false },
        { test: 'Fasting Blood Glucose', result: '94 mg/dL', refRange: '70–100 mg/dL', isAbnormal: false },
      ],
      notes: 'Inflammatory markers (ESR) elevated. Mild hyperuricemia detected; correlate clinically with arthralgia.',
    },
  },
]

export function StepDocuments() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session } = usePatientSession()
  const { t } = useTranslation()

  // State: upload & OCR simulation
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('processed') // Pre-loaded as processed for evaluation, with interactive re-upload simulation
  const [uploadProgress, setUploadProgress] = useState(100)
  const [fileName, setFileName] = useState('prescription_and_lab_report_aug2026.pdf')
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>('tl-lab-report')

  // Simulated upload process
  const triggerSimulation = (sourceName: string) => {
    setFileName(sourceName)
    setUploadStatus('uploading')
    setUploadProgress(15)

    const timer1 = setTimeout(() => {
      setUploadProgress(55)
    }, 600)

    const timer2 = setTimeout(() => {
      setUploadProgress(90)
      setUploadStatus('processing')
    }, 1200)

    const timer3 = setTimeout(() => {
      setUploadProgress(100)
      setUploadStatus('processed')
      toast({
        title: 'Document Processed',
        message: 'Simulated OCR extraction completed. Extracted clinical fields and lab values.',
        type: 'success',
      })
    }, 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  const handleFileUpload = () => {
    triggerSimulation('aiia_opd_investigation_report.pdf')
  }

  const handleTakePhoto = () => {
    triggerSimulation('scanned_prescription_tray_capture.jpg')
  }

  const toggleTimeline = (id: string) => {
    setExpandedTimelineId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="ayush">{t.documents?.badge || 'Step 8 of 10 • Medical Records'}</Badge>
            <Badge variant="saffron">OCR & Timeline</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{t.documents?.title || 'Medical Documents'}</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {t.documents?.subtitle || 'Upload previous prescriptions, lab reports, or medical documents.'}
          </p>
        </div>

        {session.patientName && (
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs shadow-xs self-start sm:self-auto">
            <span className="text-slate-500">Patient: </span>
            <span className="font-bold text-slate-800">{session.patientName}</span>
          </div>
        )}
      </div>

      {/* Upload Action Card */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-ayush-primary" />
            Upload or Scan Medical Document
          </CardTitle>
          <CardDescription>
            Place paper prescriptions onto the kiosk scanner tray or attach digital files. Supported simulated formats: PDF, JPG, PNG.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dropzone Container */}
          <div className="border-2 border-dashed border-slate-300 hover:border-ayush-primary/60 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 transition-colors flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-ayush-primary">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Drag and drop medical documents here
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Supported formats: <strong>PDF, JPG, PNG</strong> (Max 25 MB per document)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                id="btn-upload-document"
                variant="primary"
                size="md"
                onClick={handleFileUpload}
                leftIcon={<Upload className="w-4 h-4" />}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                Upload document
              </Button>
              <Button
                id="btn-take-photo-document"
                variant="outline"
                size="md"
                onClick={handleTakePhoto}
                leftIcon={<Camera className="w-4 h-4 text-slate-700" />}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                Take photo
              </Button>
            </div>
          </div>

          {/* Upload Progress Bar Simulation */}
          {uploadStatus !== 'idle' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-ayush-primary" />
                  <span className="font-bold text-slate-800">{fileName}</span>
                </div>
                <span className="font-mono text-slate-500">
                  {uploadStatus === 'uploading' && `Uploading... ${uploadProgress}%`}
                  {uploadStatus === 'processing' && 'Processing document...'}
                  {uploadStatus === 'processed' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Document processed
                    </span>
                  )}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    uploadStatus === 'processed' ? 'bg-emerald-600' : 'bg-ayush-primary'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulated OCR Extraction Results Card */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-ayush-primary" />
                  Extracted Document Information
                </CardTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Simulated OCR extraction
                </span>
              </div>
              <CardDescription className="mt-1">
                Parsed entities from recent outpatient prescription and laboratory panel.
              </CardDescription>
            </div>

            <Badge variant="ayush" className="self-start sm:self-auto">
              Confidence: High / Medium
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Explicit simulated OCR disclaimer notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Notice: Simulated OCR extraction</strong>
              <p className="mt-0.5 text-amber-800">
                This demonstration illustrates optical character recognition without connecting to an external cloud OCR API.
                All extracted values should be confirmed against the physical document by the healthcare professional.
              </p>
            </div>
          </div>

          {/* Structured Document Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <FileText className="w-3 h-3" /> Document Type
              </span>
              <p className="font-bold text-slate-800 mt-1">Prescription & Lab Report</p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Confidence: High</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Document Date
              </span>
              <p className="font-bold text-slate-800 mt-1">12 August 2026</p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Confidence: High</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Hospital / Clinic
              </span>
              <p className="font-bold text-slate-800 mt-1 truncate" title="All India Institute of Ayurveda OPD, New Delhi">
                AIIA OPD, New Delhi
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Confidence: High</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <User className="w-3 h-3" /> Prescribing Doctor
              </span>
              <p className="font-bold text-slate-800 mt-1 truncate" title="Dr. Ramesh Chandra, MD (Ayur)">
                Dr. Ramesh Chandra, MD
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Confidence: High</span>
            </div>
          </div>

          {/* Extracted Medications Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-ayush-primary" />
                Extracted Medications
              </h4>
              <span className="text-xs text-slate-500">3 Items Identified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Yogaraja Guggulu</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
                    Confidence: Medium
                  </span>
                </div>
                <p className="text-xs text-slate-600">Dosage: 2 tablets BD (after meals with warm water)</p>
                <p className="text-[11px] text-slate-400">AYUSH Classical Formulation</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Dashamoola Kashayam</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
                    Confidence: Medium
                  </span>
                </div>
                <p className="text-xs text-slate-600">Dosage: 15 ml BD + 45 ml lukewarm water</p>
                <p className="text-[11px] text-slate-400">Classical Decoction</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Aceclofenac 100mg</span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
                    Confidence: Medium
                  </span>
                </div>
                <p className="text-xs text-slate-600">Dosage: 1 tab SOS / PRN for acute pain</p>
                <p className="text-[11px] text-amber-700 font-medium">Allopathic NSAID (PRN)</p>
              </div>
            </div>
          </div>

          {/* Extracted Investigations & Highlighted Abnormal Lab Values */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-ayush-primary" />
                Extracted Investigations & Lab Results
              </h4>
              <span className="text-xs text-red-700 font-semibold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                2 Abnormal Values Detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                    <th className="py-2.5 px-3 font-semibold">Investigation (Test Name)</th>
                    <th className="py-2.5 px-3 font-semibold">Result</th>
                    <th className="py-2.5 px-3 font-semibold">Reference Range</th>
                    <th className="py-2.5 px-3 font-semibold">Clinical Status</th>
                    <th className="py-2.5 px-3 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Abnormal ESR Row */}
                  <tr className="bg-red-50/50 hover:bg-red-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      Erythrocyte Sedimentation Rate (ESR)
                    </td>
                    <td className="py-3 px-3 font-black text-red-700 text-sm">
                      38 mm/hr
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      0 – 20 mm/hr
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-red-100 text-red-800 border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Elevated (Abnormal)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">High (96%)</span>
                    </td>
                  </tr>

                  {/* Abnormal Uric Acid Row */}
                  <tr className="bg-amber-50/50 hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      Serum Uric Acid
                    </td>
                    <td className="py-3 px-3 font-black text-amber-800 text-sm">
                      7.2 mg/dL
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      2.6 – 6.0 mg/dL
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Elevated (Abnormal)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">High (94%)</span>
                    </td>
                  </tr>

                  {/* Normal Hemoglobin Row */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      Hemoglobin (Hb)
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      12.8 g/dL
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      12.0 – 15.5 g/dL
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Normal
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">High (97%)</span>
                    </td>
                  </tr>

                  {/* Normal Fasting Blood Glucose Row */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      Fasting Blood Glucose
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      94 mg/dL
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      70 – 100 mg/dL
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Normal
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">High (95%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug Interaction Placeholder / Medication Review Card */}
      <Card variant="default" className="border-amber-200 bg-gradient-to-br from-amber-50/40 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-700" />
              Medication review
            </CardTitle>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Demo interaction check
            </span>
          </div>
          <CardDescription>
            Automated herb-drug safety cross-reference between extracted Ayurvedic preparations and Allopathic compounds.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Simulated Interaction Flag: Yogaraja Guggulu + Aceclofenac
            </div>
            <p className="text-amber-900 leading-relaxed">
              <strong>Pharmacological Observation:</strong> Guggulsterones present in <em>Yogaraja Guggulu</em> exert mild anti-inflammatory and anti-platelet activity. When administered concurrently with <strong>Aceclofenac (NSAID)</strong>, there is theoretical potential for increased gastric mucosal irritation or additive anti-platelet effects.
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-amber-950 font-medium space-y-1">
              <span className="font-bold block">Clinical Recommendation for Physician:</span>
              <p>
                Consider spacing the administration of Yogaraja Guggulu and Aceclofenac by at least 2 hours. Review patient history for gastric acid sensitivity (Amlapitta).
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Disclaimer:</strong> This is a demo interaction check and does not provide actual medical advice. All medication regimens must be evaluated directly by licensed practitioners.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Medical Timeline Card */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-ayush-primary" />
              Medical Timeline
            </CardTitle>
            <span className="text-xs text-slate-500">4 Longitudinal Records</span>
          </div>
          <CardDescription>
            Chronological overview of previous visits, lab investigations, prescriptions, and today's intake assessment. Click any event to inspect records.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {INITIAL_TIMELINE.map((item) => {
              const isExpanded = expandedTimelineId === item.id

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.type === 'Current assessment'
                        ? 'bg-ayush-primary border-ayush-primary text-white shadow-xs'
                        : isExpanded
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-slate-300 text-slate-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                  </div>

                  {/* Timeline Item Container */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all shadow-xs">
                    {/* Clickable Header Bar */}
                    <button
                      type="button"
                      onClick={() => toggleTimeline(item.id)}
                      className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {item.date}
                          </span>
                          <Badge variant={item.badgeVariant} size="sm">
                            {item.type}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.facility}</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="text-xs text-ayush-primary font-semibold hidden sm:inline">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Summary snippet */}
                    <div className="px-4 pb-3 text-xs text-slate-600 border-t border-slate-100/80 pt-2">
                      {item.summary}
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs animate-fadeIn">
                        {item.clinician && (
                          <div className="text-slate-700">
                            <strong className="text-slate-900">Clinician / Observer: </strong>
                            {item.clinician}
                          </div>
                        )}

                        {/* Findings list */}
                        {item.details.findings.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                              Clinical Observations & Findings
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                              {item.details.findings.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Medications if any */}
                        {item.details.medications && item.details.medications.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                              Prescribed Regimen
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {item.details.medications.map((m, i) => (
                                <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                                  {m}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab Values table if any */}
                        {item.details.labValues && item.details.labValues.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                              Laboratory Panel Values
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.details.labValues.map((lv, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded-lg border ${
                                    lv.isAbnormal
                                      ? 'bg-red-50/70 border-red-200 text-red-900'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex justify-between items-center font-bold">
                                    <span>{lv.test}</span>
                                    <span className={lv.isAbnormal ? 'text-red-700' : 'text-slate-800'}>
                                      {lv.result}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    Ref: {lv.refRange} {lv.isAbnormal && '• Abnormal Flag'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="pt-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                          <strong className="text-slate-800">Clinical Note: </strong>
                          {item.details.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate('/patient/nadi')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {t.common?.back || 'Previous Step'}: {t.stepper?.nadi?.title || 'Nadi'}
        </Button>

        <Button
          type="button"
          id="btn-review-clinical-info"
          variant="primary"
          size="lg"
          onClick={() => {
            toast({
              title: 'Clinical Documents Recorded',
              message: 'Advancing to clinical summary review.',
              type: 'success',
            })
            navigate('/patient/summary')
          }}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          {t.documents?.continueToSummary || t.common?.continue || 'Review Clinical Information'}
        </Button>
      </div>
    </div>
  )
}
