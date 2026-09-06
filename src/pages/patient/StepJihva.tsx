import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  Sliders,
  Check,
  Stethoscope,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useTranslation } from '@/translations'

export type ObservationStatus = 'Normal' | 'Observed' | 'Not clear' | 'Needs review'

interface JihvaObservationField {
  category: string
  label: string
  sanskrit: string
  description: string
  status: ObservationStatus
  selectedFeature: string
  options: { label: string; desc: string; doshaHint?: string }[]
  doctorNote?: string
}

const INITIAL_OBSERVATIONS: JihvaObservationField[] = [
  {
    category: 'color',
    label: 'Color (Varna)',
    sanskrit: 'वर्ण परीक्षा',
    description: 'General coloration of the lingual body mucosa and papillae.',
    status: 'Observed',
    selectedFeature: 'Pale Pink with Mild Marginal Erythema',
    options: [
      { label: 'Normal Pink (Prakrita)', desc: 'Healthy vascularization and balanced tissue perfusion' },
      { label: 'Pale Pink with Mild Marginal Erythema', desc: 'Mild redness at lateral edges, suggestive of mild Pitta irritation', doshaHint: 'Pitta' },
      { label: 'Pale / Anemic (Pandu)', desc: 'Reduced hemoglobin or systemic Vata-Kapha sluggishness', doshaHint: 'Vata-Kapha' },
      { label: 'Deep Red / Crimson (Rakta)', desc: 'Heightened systemic heat or inflammatory state', doshaHint: 'Pitta' },
      { label: 'Dusky / Bluish (Shyava)', desc: 'Circulatory stasis or intense Vata vitiation', doshaHint: 'Vata' },
    ],
  },
  {
    category: 'coating',
    label: 'Coating (Lepa / Upadeha)',
    sanskrit: 'लेप / आम संचय',
    description: 'Coating thickness, distribution, and color indicative of Ama (metabolic endotoxins).',
    status: 'Observed',
    selectedFeature: 'Moderate White Posterior Coating',
    options: [
      { label: 'Thin Translucent (Nirama)', desc: 'Clean tongue body, no metabolic waste accumulation' },
      { label: 'Moderate White Posterior Coating', desc: 'Whitish layer on posterior 1/3, indicating mild gastrointestinal Ama', doshaHint: 'Ama / Kapha' },
      { label: 'Thick Yellow Coating (Pitta-Ama)', desc: 'Yellowish thick furring, indicating heat combined with toxic stagnation', doshaHint: 'Pitta-Ama' },
      { label: 'Dark / Grey Coating', desc: 'Severe dryness or chronic low metabolic fire', doshaHint: 'Vata-Ama' },
      { label: 'Patchy / Geographic', desc: 'Irregular areas of denuded papillae', doshaHint: 'Vata' },
    ],
  },
  {
    category: 'moisture',
    label: 'Moisture (Ardrata)',
    sanskrit: 'आर्द्रता एवं स्निग्धता',
    description: 'Hydration and mucosal lubrication status.',
    status: 'Observed',
    selectedFeature: 'Slightly Dry Central Dorsum',
    options: [
      { label: 'Adequately Moist (Snigdha)', desc: 'Normal salivary sheen without excess pool' },
      { label: 'Slightly Dry Central Dorsum', desc: 'Mild reduction in salivary moisture over central zone', doshaHint: 'Vata' },
      { label: 'Excessively Wet / Frothy (Picchila)', desc: 'Heavy salivation, sluggish digestion and mucosal stagnation', doshaHint: 'Kapha' },
      { label: 'Parched / Rough (Ruksha)', desc: 'Significant dehydration or severe Vata dryness', doshaHint: 'Vata' },
    ],
  },
  {
    category: 'shape',
    label: 'Shape & Margins (Akruti)',
    sanskrit: 'आकृति एवं आयाम',
    description: 'Contour, thickness, bilateral symmetry, and marginal tooth impressions.',
    status: 'Observed',
    selectedFeature: 'Mild Bilateral Scalloped Edges',
    options: [
      { label: 'Normal Symmetric Contour', desc: 'Smooth edges fitting comfortably within the dental arch' },
      { label: 'Mild Bilateral Scalloped Edges', desc: 'Indentation from teeth on margins, reflecting mild fluid retention or sluggish digestion', doshaHint: 'Kapha / Agnimandya' },
      { label: 'Swollen / Flabby (Sthula)', desc: 'Tongue enlarged with broad margins and flaccidity', doshaHint: 'Kapha' },
      { label: 'Tremulous / Deviated (Chala)', desc: 'Tremors on protrusion or lateral deviation', doshaHint: 'Vata' },
    ],
  },
  {
    category: 'surface',
    label: 'Surface & Fissures (Talata)',
    sanskrit: 'सतह एवं दरारें',
    description: 'Papillary texture, fissures, cracks, or localized mucosal changes.',
    status: 'Observed',
    selectedFeature: 'Fine Central Longitudinal Fissure',
    options: [
      { label: 'Smooth Papillary Surface', desc: 'Evenly distributed filiform and fungiform papillae' },
      { label: 'Fine Central Longitudinal Fissure', desc: 'Shallow midline crack from root to anterior middle zone', doshaHint: 'Vata' },
      { label: 'Prominent Red Papillae (Strawberry)', desc: 'Engorged fungiform papillae indicating localized heat', doshaHint: 'Pitta' },
      { label: 'Deep Transverse Cracks', desc: 'Multiple horizontal fissures showing chronic tissue dryness', doshaHint: 'Vata' },
    ],
  },
]

export function StepJihva() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session } = usePatientSession()
  const { t } = useTranslation()

  // State: capture workflow
  const [isCapturing, setIsCapturing] = useState(false)
  const [imageCaptured, setImageCaptured] = useState(true) // Prototype default pre-loaded for immediate evaluation
  const [isConfirmed, setIsConfirmed] = useState(true) // "Use Image" confirmed state
  const [activeZoneHighlight, setActiveZoneHighlight] = useState<string | null>(null)
  const [observations, setObservations] = useState<JihvaObservationField[]>(INITIAL_OBSERVATIONS)

  const handleSimulateCapture = () => {
    setIsCapturing(true)
    setTimeout(() => {
      setIsCapturing(false)
      setImageCaptured(true)
      setIsConfirmed(false) // Give user the chance to review & click "Use Image"
      toast({
        title: 'Image Captured',
        message: 'Optical tongue image captured with optimal lighting and alignment.',
        type: 'success',
      })
    }, 1200)
  }

  const handleSimulateUpload = () => {
    setIsCapturing(true)
    setTimeout(() => {
      setIsCapturing(false)
      setImageCaptured(true)
      setIsConfirmed(false)
      toast({
        title: 'Tongue Image Uploaded',
        message: 'File processed: tongue_optical_scan.jpg (1080p, Good Quality).',
        type: 'info',
      })
    }, 900)
  }

  const handleRetake = () => {
    setImageCaptured(false)
    setIsConfirmed(false)
    toast({
      title: 'Camera Active',
      message: 'Viewfinder reset. Position tongue within the framing guide.',
      type: 'info',
    })
  }

  const handleUseImage = () => {
    setIsConfirmed(true)
    toast({
      title: 'Image Confirmed for Review',
      message: 'Preliminary observational parameters extracted for clinical verification.',
      type: 'success',
    })
  }

  const handleStatusChange = (category: string, newStatus: ObservationStatus) => {
    setObservations((prev) =>
      prev.map((field) => (field.category === category ? { ...field, status: newStatus } : field))
    )
  }

  const handleFeatureSelect = (category: string, featureLabel: string) => {
    setObservations((prev) =>
      prev.map((field) =>
        field.category === category ? { ...field, selectedFeature: featureLabel, status: 'Observed' } : field
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header & Identification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="ayush">{t.jihva?.badge || 'Step 6 of 10 • AYUSH Pariksha'}</Badge>
            <Badge variant="saffron">Jihva Pariksha</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{t.jihva?.title || 'Jihva Assessment'}</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {t.jihva?.subtitle || 'Capture tongue information for the healthcare professional.'}
          </p>
        </div>

        {session.patientName && (
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs shadow-xs self-start sm:self-auto">
            <span className="text-slate-500">Patient: </span>
            <span className="font-bold text-slate-800">{session.patientName}</span>
            {session.age && <span className="text-slate-500"> ({session.age}y)</span>}
          </div>
        )}
      </div>

      {/* Mandatory Non-Diagnostic Clinical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-amber-950">
            {t.common?.safetyNotice || 'Clinical Decision Support Notice'}
          </p>
          <p className="leading-relaxed">
            {t.common?.autonomousDisclaimer || 'AI-assisted image analysis is for clinical decision support only and requires professional review. This terminal does not perform autonomous diagnosis of medical conditions. All extracted indicators must be verified by the consulting Ayurvedic doctor.'}
          </p>
        </div>
      </div>

      {/* Primary Capture / Viewfinder Card */}
      <Card variant="default" className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-ayush-primary" />
              Optical Tongue Image Acquisition
            </CardTitle>
            {imageCaptured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Image quality: Good
              </span>
            )}
          </div>
          <CardDescription>
            High-resolution capture calibrated for lingual coating, moisture, and papillary pattern recognition.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!imageCaptured ? (
            /* Live Camera Viewfinder Simulation */
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-8 text-center text-white overflow-hidden min-h-[320px] flex flex-col items-center justify-center">
              {/* Alignment Oval Frame */}
              <div className="relative w-48 h-64 border-2 border-dashed border-emerald-400/80 rounded-[50%] flex flex-col items-center justify-center bg-slate-900/60 shadow-inner">
                <div className="absolute top-2 px-2 py-0.5 bg-emerald-950/80 text-emerald-300 text-[10px] rounded-md font-mono">
                  ALIGN TONGUE HERE
                </div>
                <Camera className="w-12 h-12 text-emerald-400/60 mb-2 animate-pulse" />
                <div className="text-xs font-semibold text-slate-300">Natural daylight / white LED</div>
                <div className="text-[10px] text-slate-400 mt-1">Distance ~15 cm from lens</div>
              </div>

              {/* Status indicators */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Lighting: Optimal (450 lux)
                </span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">
                  Focus: Macro Lock
                </span>
              </div>

              {/* Capture & Upload Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <Button
                  id="btn-capture-tongue"
                  variant="primary"
                  size="lg"
                  isLoading={isCapturing}
                  onClick={handleSimulateCapture}
                  leftIcon={<Camera className="w-5 h-5" />}
                  className="shadow-sm"
                >
                  Capture Image
                </Button>
                <Button
                  id="btn-upload-tongue"
                  variant="outline"
                  size="lg"
                  disabled={isCapturing}
                  onClick={handleSimulateUpload}
                  leftIcon={<Upload className="w-5 h-5" />}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Upload Image
                </Button>
              </div>
            </div>
          ) : (
            /* Captured Preview & Diagnostic Landmark Overlay */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Visual Preview Box */}
                <div className="md:col-span-6 bg-slate-950 rounded-2xl p-4 border border-slate-800 relative flex flex-col items-center justify-center min-h-[300px]">
                  {/* Quality & Mode Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Image quality: Good
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[10px]">
                      1920 × 1080 • Macro
                    </span>
                  </div>

                  {/* Simulated High-Fidelity Tongue Diagram with Classical Anatomical Zones */}
                  <div className="relative my-2 py-2">
                    <svg
                      width="210"
                      height="250"
                      viewBox="0 0 210 250"
                      className="drop-shadow-lg"
                    >
                      <defs>
                        {/* Tongue base gradient */}
                        <radialGradient id="tongueGradient" cx="50%" cy="40%" r="55%">
                          <stop offset="0%" stopColor="#F8A5A5" />
                          <stop offset="45%" stopColor="#E9777A" />
                          <stop offset="90%" stopColor="#D85D64" />
                          <stop offset="100%" stopColor="#B33942" />
                        </radialGradient>

                        {/* Ama / White coating gradient on posterior */}
                        <radialGradient id="coatingGradient" cx="50%" cy="20%" r="45%">
                          <stop offset="0%" stopColor="#F5F3EF" stopOpacity="0.88" />
                          <stop offset="60%" stopColor="#EDE9E3" stopOpacity="0.65" />
                          <stop offset="100%" stopColor="#F5F3EF" stopOpacity="0" />
                        </radialGradient>

                        {/* Pitta erythema on tip & edges */}
                        <radialGradient id="erythemaGradient" cx="50%" cy="85%" r="35%">
                          <stop offset="0%" stopColor="#C02626" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="#C02626" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Tongue Body Path */}
                      <path
                        d="M 45 40 C 45 15, 165 15, 165 40 C 175 90, 185 170, 105 235 C 25 170, 35 90, 45 40 Z"
                        fill="url(#tongueGradient)"
                        stroke="#991B1B"
                        strokeWidth="2.5"
                      />

                      {/* Posterior White Coating (Ama representation) */}
                      <ellipse
                        cx="105"
                        cy="65"
                        rx="45"
                        ry="25"
                        fill="url(#coatingGradient)"
                      />

                      {/* Central Longitudinal Fissure Line */}
                      <path
                        d="M 105 55 Q 106 110 105 170"
                        stroke="#831843"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        opacity="0.75"
                      />

                      {/* Erythema wash on anterior apex / tip */}
                      <ellipse
                        cx="105"
                        cy="210"
                        rx="30"
                        ry="15"
                        fill="url(#erythemaGradient)"
                      />

                      {/* Bilateral subtle scallop marks */}
                      <path d="M 43 90 Q 48 97 44 104" stroke="#7F1D1D" strokeWidth="1.5" fill="none" />
                      <path d="M 45 120 Q 50 127 46 134" stroke="#7F1D1D" strokeWidth="1.5" fill="none" />
                      <path d="M 167 90 Q 162 97 166 104" stroke="#7F1D1D" strokeWidth="1.5" fill="none" />
                      <path d="M 165 120 Q 160 127 164 134" stroke="#7F1D1D" strokeWidth="1.5" fill="none" />

                      {/* Interactive Zone Markers */}
                      <g className="cursor-pointer">
                        {/* Posterior / Root */}
                        <circle
                          cx="105"
                          cy="65"
                          r="12"
                          className="fill-amber-400/30 stroke-amber-300 stroke-1 hover:fill-amber-400/60 transition-colors"
                          onClick={() => setActiveZoneHighlight('root')}
                        />
                        <text x="105" y="69" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="bold">Ama</text>

                        {/* Middle / Agni */}
                        <circle
                          cx="105"
                          cy="130"
                          r="10"
                          className="fill-emerald-400/30 stroke-emerald-300 stroke-1 hover:fill-emerald-400/60 transition-colors"
                          onClick={() => setActiveZoneHighlight('middle')}
                        />
                        <text x="105" y="133" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold">Agni</text>

                        {/* Apex / Tip */}
                        <circle
                          cx="105"
                          cy="205"
                          r="10"
                          className="fill-rose-400/30 stroke-rose-300 stroke-1 hover:fill-rose-400/60 transition-colors"
                          onClick={() => setActiveZoneHighlight('tip')}
                        />
                        <text x="105" y="208" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold">Tip</text>
                      </g>
                    </svg>
                  </div>

                  {/* Caption underneath image */}
                  <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 mt-1">
                    <Eye className="w-3.5 h-3.5 text-slate-300" />
                    Interactive lingual topography: click markers to examine anatomical zones
                  </div>
                </div>

                {/* Preview Actions & Quality Assessment Summary */}
                <div className="md:col-span-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-ayush-primary" />
                      Optical Validation Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Illumination</span>
                        <span className="font-semibold text-emerald-700">Uniform Daylight</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Focus / Sharpness</span>
                        <span className="font-semibold text-emerald-700">High Clarity</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Coating Visibility</span>
                        <span className="font-semibold text-slate-800">Clear Posterior 1/3</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Margin Detection</span>
                        <span className="font-semibold text-slate-800">Bilateral Borders</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        Image accepted for clinical feature review. You can retake if lighting or tongue protrusion was suboptimal.
                      </span>
                    </div>
                  </div>

                  {/* Confirmation & Retake Controls */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      id="btn-use-tongue-image"
                      variant="primary"
                      size="lg"
                      onClick={handleUseImage}
                      leftIcon={<Check className="w-5 h-5" />}
                      className="flex-1 min-w-[160px]"
                    >
                      {isConfirmed ? 'Image Confirmed' : 'Use Image'}
                    </Button>
                    <Button
                      id="btn-retake-tongue-image"
                      variant="outline"
                      size="lg"
                      onClick={handleRetake}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      className="min-w-[120px]"
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              </div>

              {activeZoneHighlight && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>
                      {activeZoneHighlight === 'root' && 'Posterior Root Zone: Corresponds classical Pakwashaya & Colon / Ama retention.'}
                      {activeZoneHighlight === 'middle' && 'Middle Dorsum Zone: Corresponds to Amashaya & Grahani / Digestive fire (Agni).'}
                      {activeZoneHighlight === 'tip' && 'Apex / Tip Zone: Corresponds to Hridaya & Prana Vata / Circulatory heat.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveZoneHighlight(null)}
                    className="text-slate-500 hover:text-slate-700 font-bold px-2 py-0.5"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structured Jihva Observations Section */}
      <Card variant="default" className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-ayush-primary" />
                Structured Jihva Observations
              </CardTitle>
              <CardDescription>
                Systematic categorization across 5 classical diagnostic criteria: Color, Coating, Moisture, Shape, and Surface.
              </CardDescription>
            </div>
            <Badge variant="ayush" className="self-start sm:self-auto">
              5 Parameters
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-xs text-slate-500">
            Select the observed status for each criterion. Options include <strong>Normal</strong>, <strong>Observed</strong>, <strong>Not clear</strong>, and <strong>Needs review</strong>. Findings are shared with the healthcare professional for final assessment.
          </p>

          <div className="space-y-5 divide-y divide-slate-100">
            {observations.map((item, idx) => (
              <div key={item.category} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.label}</span>
                      <span className="text-xs font-serif text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {item.sanskrit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>

                  {/* Tri-state / Multi-state Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    {(['Normal', 'Observed', 'Not clear', 'Needs review'] as ObservationStatus[]).map((statusVal) => {
                      const isSelected = item.status === statusVal
                      return (
                        <button
                          key={statusVal}
                          type="button"
                          onClick={() => handleStatusChange(item.category, statusVal)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            isSelected
                              ? statusVal === 'Normal'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : statusVal === 'Observed'
                                ? 'bg-ayush-primary text-white shadow-xs'
                                : statusVal === 'Needs review'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {statusVal}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Specific Observation Selector Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {item.options.map((opt) => {
                    const isFeatureSelected = item.selectedFeature === opt.label
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleFeatureSelect(item.category, opt.label)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isFeatureSelected
                            ? 'bg-ayush-surface border-ayush-primary shadow-xs ring-1 ring-ayush-primary/30'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                          {opt.doshaHint && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {opt.doshaHint}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Explicit Clinician Verification Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
            <Stethoscope className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Observer Validation Protocol</span>
              <p className="mt-0.5">
                The observations selected above represent visual biometric parameters recorded during the patient terminal intake.
                The Ayurvedic clinician will correlate these findings with Nadi Pariksha, Kostha, and Agni before establishing any clinical diagnosis.
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/patient/ayush')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {t.common?.back || 'Previous Step'}: {t.stepper?.ayush?.title || 'AYUSH Assessment'}
            </Button>

            <Button
              type="button"
              id="btn-continue-to-nadi"
              variant="primary"
              size="lg"
              onClick={() => {
                toast({
                  title: 'Jihva Assessment Saved',
                  message: 'Tongue observations recorded. Advancing to Nadi Assessment.',
                  type: 'success',
                })
                navigate('/patient/nadi')
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-sm"
            >
              {t.jihva?.continueToNadi || t.common?.continue || 'Proceed to Nadi Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
