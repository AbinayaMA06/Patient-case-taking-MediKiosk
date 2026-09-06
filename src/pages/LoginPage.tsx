import { useNavigate } from 'react-router-dom'
import {
  User,
  Stethoscope,
  Building2,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      subtitle: 'Self-Service Intake Kiosk',
      description:
        'Self-guided clinical intake with multilingual voice assistance, ABHA identification, symptom logging, and instant token generation.',
      icon: <User className="w-8 h-8 text-emerald-700" />,
      badge: 'Public Kiosk',
      badgeVariant: 'ayush' as const,
      route: '/patient/identify',
      actionText: 'Enter Patient Kiosk',
      features: ['Voice & Touch Intake', 'Prakriti & Jihva Evaluation', 'OPD Token Slip'],
    },
    {
      id: 'doctor',
      title: 'Doctor',
      subtitle: 'Physician Clinical Portal',
      description:
        'Real-time outpatient queue, AI clinical summaries, NAMASTE / ICD-11 coding review, Jihva & Nadi inspection, and note verification.',
      icon: <Stethoscope className="w-8 h-8 text-sky-700" />,
      badge: 'Clinical Staff',
      badgeVariant: 'default' as const,
      route: '/doctor',
      actionText: 'Access Doctor Queue',
      features: ['Patient Queue Triage', 'Traceable AI Summaries', 'Verified Prescription Notes'],
    },
    {
      id: 'admin',
      title: 'Administrator',
      subtitle: 'Hospital Operations & Telemetry',
      description:
        'Monitor active kiosk terminals, track patient throughput, view language distribution analytics, and verify ABDM system health.',
      icon: <Building2 className="w-8 h-8 text-amber-700" />,
      badge: 'Hospital Admin',
      badgeVariant: 'saffron' as const,
      route: '/admin',
      actionText: 'Open Admin Dashboard',
      features: ['Kiosk Hardware Status', 'Language Analytics', 'ABDM Sandbox Telemetry'],
    },
    {
      id: 'caregiver',
      title: 'Caregiver / Proxy',
      subtitle: 'Assisted Patient Intake',
      description:
        'Facilitated intake on behalf of elderly, pediatric, or disabled relatives with proxy relationship documentation and consent capture.',
      icon: <HeartHandshake className="w-8 h-8 text-purple-700" />,
      badge: 'Assisted Mode',
      badgeVariant: 'neutral' as const,
      route: '/patient/identify?proxy=true',
      actionText: 'Start Assisted Intake',
      features: ['Proxy Consent Capture', 'Assisted Symptom Walkthrough', 'Guardian Contact Linking'],
    },
  ]

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ayush-surface/50 to-[#FAFAF7]">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-ayush-border shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-ayush-primary tracking-wide uppercase">
              Ministry of AYUSH • Role-Based Gateway
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to MediKiosk
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Select your role to access the dedicated clinical terminal.
          </p>

          <p className="text-xs text-slate-400">
            For evaluation, this prototype uses instant role navigation without requiring physical smartcards or OTPs.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              variant="interactive"
              onClick={() => navigate(role.route)}
              className="flex flex-col justify-between group hover:border-ayush-primary hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-ayush-surface border border-ayush-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    {role.icon}
                  </div>
                  <Badge variant={role.badgeVariant} size="md">
                    {role.badge}
                  </Badge>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-ayush-primary transition-colors">
                  {role.title}
                </h3>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {role.subtitle}
                </h4>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {role.description}
                </p>

                {/* Key features bullet pills */}
                <div className="space-y-1.5 mb-6 pt-4 border-t border-slate-100">
                  {role.features.map((feat, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-500 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-ayush-primary/60"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={role.id === 'patient' ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full justify-between group-hover:bg-ayush-primary group-hover:text-white group-hover:border-ayush-primary transition-all"
                  rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                >
                  {role.actionText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Helper Note */}
        <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500 bg-white/70 py-3.5 px-6 rounded-2xl border border-ayush-border/60 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-ayush-primary" />
            <span>Touch Kiosk Ready</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-sky-600" />
            <span>Desktop & Tablet Optimized</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Zero Authentication Mock Lag</span>
        </div>
      </div>
    </div>
  )
}
