import { useState } from 'react'
import {
  Building2,
  Cpu,
  Globe,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Activity,
  FileCheck,
  Server,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { useSystem } from '@/context/SystemContext'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'

export function AdminPortal() {
  const { toast } = useToast()
  const {
    adminAnalytics,
    isAiAssistanceConsented,
    setAiAssistanceConsented,
    openEndSessionModal,
    offlineStatus,
    isOffline,
    toggleOfflineMode,
  } = useSystem()

  const [activeTab, setActiveTab] = useState<'overview' | 'privacy' | 'fleet'>('overview')

  const handleRefresh = () => {
    toast({
      title: 'Telemetry Synchronized',
      message: 'OPD Terminal metrics, queue counters, and ABDM logs updated.',
      type: 'info',
    })
  }

  const handleToggleAiConsent = () => {
    const nextState = !isAiAssistanceConsented
    setAiAssistanceConsented(nextState)
    toast({
      title: nextState ? 'AI Decision Assistance Enabled' : 'AI Decision Assistance Opted Out',
      message: nextState
        ? 'Clinical drafting and NAMASTE suggestion engine active.'
        : 'Patient opted out: Kiosk will operate in manual capture mode only.',
      type: nextState ? 'success' : 'warning',
    })
  }

  const kiosks = [
    { id: 'AYUSH-KIOSK-01', location: 'Main OPD Lobby A', status: 'Online', battery: '100%', intakes: 48, latency: '42ms' },
    { id: 'AYUSH-KIOSK-02', location: 'Panchakarma Wing', status: 'Online', battery: '98%', intakes: 36, latency: '51ms' },
    { id: 'AYUSH-KIOSK-03', location: 'Kayachikitsa Dept', status: 'Online', battery: '100%', intakes: 42, latency: '38ms' },
    { id: 'AYUSH-KIOSK-04', location: 'OPD Ground Floor (Active)', status: isOffline ? 'Offline' : 'In Use', battery: '95%', intakes: 52, latency: isOffline ? 'N/A' : '33ms' },
    { id: 'AYUSH-KIOSK-05', location: 'Shalya / Shalakya', status: 'Online', battery: '91%', intakes: 28, latency: '45ms' },
    { id: 'AYUSH-KIOSK-06', location: 'Yoga & Naturopathy Block', status: 'Online', battery: '100%', intakes: 21, latency: '60ms' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Offline Status Alert if active */}
      {isOffline && <OfflineIndicator compact={false} showToggle={true} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-ayush-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Admin & Operations Dashboard
              </h1>
              <Badge variant="saffron" size="sm">
                Segment 6 Active
              </Badge>
              <Badge variant="outline" size="sm">
                NHA-ABDM Node #4
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Ministry of AYUSH • Central Hospital Intake Monitoring, Privacy & Fleet Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Sync Telemetry
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={openEndSessionModal}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            End Kiosk Session
          </Button>
        </div>
      </div>

      {/* Mandatory Security Disclaimer (Segment 6) */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 shadow-sm flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-bold text-white flex items-center gap-2">
            <span>Production Security & Compliance Protocol Notice</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
              ABDM / DPDP
            </span>
          </p>
          <p className="text-slate-300 leading-relaxed font-sans">
            Production deployment should implement ABDM/ABHA authentication, granular consent,
            DPDP-compliant data handling, encryption, audit logging, and secure session management.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-ayush-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Operational Metrics & Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-ayush-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Privacy, Consent & Offline-First
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'fleet'
              ? 'bg-ayush-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Terminal Health Status ({kiosks.length})
        </button>
      </div>

      {/* TAB 1: OPERATIONAL METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 6 Key Operational Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Patient Volume */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Patient Volume</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {adminAnalytics.patientVolumeToday}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <Users className="w-3.5 h-3.5" /> +18.4% vs daily average
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* 2. Average Intake Duration */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Avg Intake Duration</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {adminAnalytics.averageIntakeDurationMinutes}m
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" /> Fast-track OPD SLA met
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* 3. Red-Flag Triage Rate */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Red-Flag Triage Rate</span>
                  <div className="text-3xl font-black text-rose-600 mt-1">
                    {adminAnalytics.redFlagTriageRate}
                  </div>
                  <span className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 8 priority ER escalations
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* 4. AI Assistance Acceptance Rate */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">AI Acceptance Rate</span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">
                    {adminAnalytics.aiAssistanceAcceptanceRate}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Doctors endorsed draft
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* 5. Terminal Health Status */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Terminal Health Status</span>
                  <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>{adminAnalytics.terminalHealthStatus}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 6 / 6 online • Avg lag 42ms
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* 6. Consent Opt-In Rate */}
            <Card variant="default">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">AI Consent Active</span>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {isAiAssistanceConsented ? 'Consented (Active)' : 'Opted Out'}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Patient governed
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Complaints & Language Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Complaints Card */}
            <Card variant="default">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Top Reported Clinical Complaints (ICD-11 TM2 / NAMASTE)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                {adminAnalytics.topComplaints.map((item, idx) => (
                  <div key={item.complaint} className="space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>
                        #{idx + 1} {item.complaint}
                      </span>
                      <span>
                        {item.count} intakes ({item.percentage})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ayush-primary rounded-full"
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dialect / Language Intake Distribution */}
            <Card variant="default">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>Multilingual Voice & Vernacular Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                {[
                  { lang: 'Hindi (हिंदी)', pct: '48%', count: 88 },
                  { lang: 'English', pct: '28%', count: 52 },
                  { lang: 'Tamil (தமிழ்)', pct: '12%', count: 22 },
                  { lang: 'Telugu (తెలుగు)', pct: '7%', count: 13 },
                  { lang: 'Bengali / Kannada', pct: '5%', count: 9 },
                ].map((item) => (
                  <div key={item.lang} className="space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{item.lang}</span>
                      <span>
                        {item.count} intakes ({item.pct})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-saffron-secondary rounded-full"
                        style={{ width: item.pct }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVACY, CONSENT & OFFLINE-FIRST SIMULATION */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Offline First Simulation Box */}
          <Card variant="highlight" className="border-2 border-slate-300">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-700" />
                  <span>Offline-First Simulation & Cache Engine</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Current Mode:</span>
                  <Badge variant={isOffline ? 'warning' : 'ayush'} size="sm">
                    {offlineStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The MediKiosk terminal is designed to function seamlessly in peripheral rural and
                network-constrained primary health centers. All clinical forms, voice transcriptions,
                and queue entries are cached locally.
              </p>

              {/* Live Offline Component */}
              <OfflineIndicator compact={false} showToggle={true} />

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Simulate Offline Mode Transition</span>
                  <span className="text-slate-500">
                    Switch between Online, Offline, and Sync Pending states to test offline resiliency.
                  </span>
                </div>
                <Button
                  variant={isOffline ? 'primary' : 'outline'}
                  size="sm"
                  onClick={toggleOfflineMode}
                >
                  {isOffline ? 'Switch to Online' : 'Simulate Offline'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Section as requested in Segment 6 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Kiosk Ephemeral Session Policy */}
            <Card variant="default">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Ephemeral Session Policy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero persistent storage on kiosk hardware after session finalization. Terminal
                  memory is wiped immediately upon sign-off, protecting patient confidentiality in
                  public hospital waiting lounges.
                </p>
              </CardContent>
            </Card>

            {/* 2. ABDM / ABHA Compliance Note */}
            <Card variant="default">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">ABDM / ABHA Compliance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full adherence to the Ayushman Bharat Digital Mission (M1, M2, M3 milestone)
                  standards. ABHA ID authentication triggers encrypted FHIR bundle transmission to
                  designated hospital OPD systems.
                </p>
              </CardContent>
            </Card>

            {/* 3. Data Minimization Notice */}
            <Card variant="default">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Data Minimization Notice</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In accordance with DPDP Act provisions, only clinically necessary data bounded by
                  the chief complaint and red-flag screening are gathered during intake.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Consent Management & End Session Controls */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Patient Consent & Kiosk Hygiene Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* AI Assistance Consent Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      AI Clinical Decision Support Assistance
                    </span>
                    <Badge variant={isAiAssistanceConsented ? 'ayush' : 'default'} size="sm">
                      {isAiAssistanceConsented ? 'Consented' : 'Opted Out'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    Allow patient or healthcare worker to opt out of AI-assisted clinical drafting.
                    When opted out, all NAMASTE / ICD-11 TM2 code mappings and clinical summaries
                    must be entered entirely manually by the physician.
                  </p>
                </div>

                <Button
                  variant={isAiAssistanceConsented ? 'secondary' : 'outline'}
                  size="md"
                  onClick={handleToggleAiConsent}
                  leftIcon={
                    isAiAssistanceConsented ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )
                  }
                >
                  {isAiAssistanceConsented ? 'Opt-Out of AI' : 'Enable AI Consent'}
                </Button>
              </div>

              {/* End Session & Purge Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-950 text-sm">
                      Immediate End Session & Memory Sanitization
                    </span>
                    <Badge variant="danger" size="sm">
                      Sanitize Terminal
                    </Badge>
                  </div>
                  <p className="text-xs text-rose-800 max-w-xl">
                    Clear all captured intake data from device memory, remove session tokens, and
                    return the kiosk terminal to the initial landing screen for the next waiting
                    patient.
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="md"
                  onClick={openEndSessionModal}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  End Session & Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: TERMINAL FLEET */}
      {activeTab === 'fleet' && (
        <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base">Hospital Terminal Fleet Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="divide-y divide-slate-100 text-sm">
              {kiosks.map((k) => (
                <div
                  key={k.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        k.status === 'Online'
                          ? 'bg-emerald-500'
                          : k.status === 'In Use'
                          ? 'bg-sky-500 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-bold text-slate-900">{k.id}</h4>
                      <p className="text-xs text-slate-500">{k.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600 font-medium">{k.intakes} intakes</span>
                    <span className="text-slate-400">Battery: {k.battery}</span>
                    <span className="text-slate-400 font-mono">Ping: {k.latency}</span>
                    <Badge
                      variant={
                        k.status === 'Online'
                          ? 'ayush'
                          : k.status === 'In Use'
                          ? 'default'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {k.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
