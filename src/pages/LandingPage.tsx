import { Link } from 'react-router-dom'
import {
  Languages,
  Sparkles,
  ClipboardCheck,
  FileScan,
  FileText,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function LandingPage() {
  const features = [
    {
      icon: <Languages className="w-6 h-6 text-emerald-700" />,
      title: 'Multilingual AI',
      description:
        'Conversational voice and touchscreen intake supporting 12+ Indian official languages with dialect adaptability for semi-literate and rural patients.',
      badge: 'Voice + Touch',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      title: 'AYUSH Intelligence',
      description:
        'Structured Prakriti, Agni, and Kostha baseline evaluation with automated Jihva (tongue) and Nadi (pulse) complementary indicators.',
      badge: 'Standardized',
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-800" />,
      title: 'Smart History',
      description:
        'Chronological symptom progression, previous treatments, and automated red-flag screening for urgent medical conditions.',
      badge: 'Red-Flag Triage',
    },
    {
      icon: <FileScan className="w-6 h-6 text-sky-700" />,
      title: 'Medical OCR',
      description:
        'On-device document digitization for previous paper prescriptions, lab reports, and discharge summaries with medical entity extraction.',
      badge: 'Instant Digitize',
    },
    {
      icon: <FileText className="w-6 h-6 text-teal-700" />,
      title: 'Clinical Summary',
      description:
        'Traceable, physician-ready consultation notes aligned with NAMASTE portal terminology and ICD-11 AYUSH diagnostic coding.',
      badge: 'EHR Ready',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-700" />,
      title: 'Secure by Design',
      description:
        'Seamless ABHA ID verification, ABDM health data consent framework, and strict local privacy compliance for hospital terminals.',
      badge: 'ABDM Compliant',
    },
  ]

  const workflowSteps = [
    { step: '01', title: 'Identify', desc: 'ABHA ID / Mobile verification' },
    { step: '02', title: 'Capture', desc: 'Spoken / touch clinical symptoms' },
    { step: '03', title: 'Assess', desc: 'Prakriti, Jihva & Nadi indicators' },
    { step: '04', title: 'Digitize', desc: 'Scan previous medical records' },
    { step: '05', title: 'Summarize', desc: 'AI generates clinical note' },
    { step: '06', title: 'Verify', desc: 'Physician reviews & validates' },
    { step: '07', title: 'Token', desc: 'Printed OPD consultation pass' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-ayush-surface/80 via-[#FAFAF7] to-[#FAFAF7] border-b border-ayush-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Government / SIH Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-ayush-border shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-xs font-bold text-ayush-primary uppercase tracking-wider">
                Ministry of AYUSH • Smart India Hackathon
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              AI-Powered Clinical History for{' '}
              <span className="text-ayush-primary underline decoration-ayush-accent/40 decoration-wavy underline-offset-8">
                AYUSH Healthcare
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto italic">
              “Capture patient history intelligently. Standardize AYUSH assessments. Assist physicians with trusted, traceable clinical summaries.”
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link to="/patient/identify" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="kiosk"
                  className="w-full sm:w-auto min-w-[240px]"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Patient Assessment
                </Button>
              </Link>

              <Link to="/doctor" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="kiosk"
                  className="w-full sm:w-auto min-w-[180px]"
                  leftIcon={<Stethoscope className="w-5 h-5 text-ayush-primary" />}
                >
                  Doctor Login
                </Button>
              </Link>

              <Link to="/admin" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="kiosk"
                  className="w-full sm:w-auto text-slate-600 hover:text-slate-900"
                >
                  Admin Portal
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-6 border-t border-slate-200/80">
              <div className="bg-white/80 p-3.5 rounded-2xl border border-ayush-border/60 text-center">
                <div className="text-2xl font-black text-ayush-primary">70%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Intake Time Saved</div>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-ayush-border/60 text-center">
                <div className="text-2xl font-black text-ayush-primary">12+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Regional Dialects</div>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-ayush-border/60 text-center">
                <div className="text-2xl font-black text-ayush-primary">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">ABDM Standard Compliant</div>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-ayush-border/60 text-center">
                <div className="text-2xl font-black text-ayush-primary">0%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Clinical Data Loss</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="py-14 sm:py-18 bg-white border-b border-ayush-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="ayush" size="md" className="mb-2">
              Step-by-Step Flow
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Standardized Clinical Intake Journey
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              From arrival at the AYUSH hospital kiosk to verified consultation token in minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {workflowSteps.map((item, idx) => (
              <div
                key={item.step}
                className="relative bg-ayush-surface/50 border border-ayush-border p-4 rounded-2xl text-center flex flex-col items-center justify-between hover:border-ayush-primary/40 hover:bg-ayush-surface transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-ayush-border text-xs font-black text-ayush-primary flex items-center justify-center mb-3 shadow-2xs group-hover:bg-ayush-primary group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {item.desc}
                </p>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-ayush-border font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/patient/identify">
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Experience Interactive Kiosk Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Feature Cards */}
      <section className="py-14 sm:py-20 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="saffron" size="md" className="mb-2">
              Intelligent Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for AYUSH Clinical Excellence
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Combining age-old diagnostic traditions with cutting-edge medical artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                variant="interactive"
                className="flex flex-col justify-between"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-ayush-surface border border-ayush-border flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <Badge variant="default" size="sm">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Callout: AYUSH Standardization & Triage */}
      <section className="py-12 bg-white border-t border-ayush-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-[#0E4D34] to-[#16724E] rounded-3xl p-8 sm:p-12 text-white shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge variant="saffron" size="sm" className="bg-amber-400 text-amber-950 font-bold border-none">
                  SIH Focus Area
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Bridging Traditional Diagnostic Paradigms with Modern Health Informatics
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                  MediKiosk standardizes terminology across Ayurveda, Yoga, Unani, Siddha, and Homeopathy, integrating the National AYUSH Morbidity and Standardized Terminologies Electronic Portal (NAMASTE) with ABDM FHIR resources.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Jihva (Tongue) Ama Assessment
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Nadi Pariksha Gati Logging
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Red-flag Emergency Interception
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-300" /> Live Hospital Simulation
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-emerald-100">Average Kiosk Completion:</span>
                    <span className="font-bold text-white">4 minutes 12 seconds</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-emerald-100">Patient Satisfaction Rate:</span>
                    <span className="font-bold text-white">96.4% across 8 dialects</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-emerald-100">Doctor Verification Speed:</span>
                    <span className="font-bold text-white">&lt; 90 seconds / summary</span>
                  </div>
                </div>

                <Link to="/patient/identify" className="block pt-2">
                  <Button variant="accent" size="lg" className="w-full">
                    Launch Interactive Intake Kiosk
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
