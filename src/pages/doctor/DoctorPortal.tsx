import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Stethoscope,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Info,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSystem } from '@/context/SystemContext'
import { useToast } from '@/hooks/useToast'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'

type DashboardSection =
  | "Today's Queue"
  | 'Waiting Patients'
  | 'In Consultation'
  | 'Completed'
  | 'Urgent Review'

export function DoctorPortal() {
  const { queue, progressQueue, updatePatientStatus, resetQueue, isOffline } =
    useSystem()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<DashboardSection>("Today's Queue")
  const [searchQuery, setSearchQuery] = useState('')

  const handleSimulateProgression = () => {
    progressQueue()
    toast({
      title: 'Queue Progression Simulated',
      message: 'Active consultation completed; next waiting patient called into OPD Room #14.',
      type: 'success',
    })
  }

  const handleResetQueue = () => {
    resetQueue()
    toast({
      title: 'Queue State Reset',
      message: 'Demo queue restored to initial clinical state.',
      type: 'info',
    })
  }

  // Filter patients based on section
  const filteredPatients = queue.filter((patient) => {
    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = patient.patientName.toLowerCase().includes(q)
      const matchesComplaint = patient.chiefComplaint.toLowerCase().includes(q)
      const matchesToken = patient.tokenNumber.toLowerCase().includes(q)
      if (!matchesName && !matchesComplaint && !matchesToken) return false
    }

    // Section tab matching
    switch (activeSection) {
      case 'Waiting Patients':
        return patient.status === 'Waiting'
      case 'In Consultation':
        return patient.status === 'In Consultation'
      case 'Completed':
        return patient.status === 'Completed'
      case 'Urgent Review':
        return patient.priority === 'Red-Flag' || patient.summaryReadiness === 'Urgent Review Needed'
      case "Today's Queue":
      default:
        return true
    }
  })

  // Quick statistics
  const totalCount = queue.length
  const waitingCount = queue.filter((p) => p.status === 'Waiting').length
  const inProgressCount = queue.filter((p) => p.status === 'In Consultation').length
  const completedCount = queue.filter((p) => p.status === 'Completed').length
  const urgentCount = queue.filter(
    (p) => p.priority === 'Red-Flag' || p.summaryReadiness === 'Urgent Review Needed'
  ).length

  // Progression preview elements
  const currentInConsult = queue.find((p) => p.status === 'In Consultation')
  const nextWaiting = queue.find((p) => p.status === 'Waiting')
  const completedList = queue.filter((p) => p.status === 'Completed')
  const lastCompleted = completedList[completedList.length - 1]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Offline Status Alert if active */}
      {isOffline && <OfflineIndicator compact={false} showToggle={true} />}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-ayush-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200 shrink-0">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Dr. Anand Kulkarni (MD Ayu)
              </h1>
              <Badge variant="ayush" size="sm">
                OPD Room #14
              </Badge>
              <Badge variant="saffron" size="sm">
                Kayachikitsa Specialist
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Ministry of AYUSH Central Hospital • Outpatient Clinical Decision & Verification Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/patient/token">
            <Button variant="outline" size="md">
              Kiosk Token View
            </Button>
          </Link>
          <Link to="/patient/summary">
            <Button variant="secondary" size="md">
              Patient Summary View
            </Button>
          </Link>
        </div>
      </div>

      {/* Simulated Token Progression Controller (Segment 6) */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-950 to-slate-900 text-white shadow-md border border-emerald-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                Segment 6 • Queue Progression Simulator
              </span>
              <span className="text-xs text-slate-400 font-mono">OPD Room 14 Engine</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Simulated Token Progression
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Advance the outpatient queue to demonstrate token lifecycle progression:
              <span className="font-mono text-emerald-400 ml-1">
                {lastCompleted ? lastCompleted.tokenNumber : 'A-040'} (Completed) → {currentInConsult ? currentInConsult.tokenNumber : 'A-041'} (In Consultation) → {nextWaiting ? nextWaiting.tokenNumber : 'A-042'} (Waiting)
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleSimulateProgression}
              leftIcon={<Play className="w-4 h-4 text-emerald-300" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-0 shadow-sm"
            >
              Simulate Token Progression
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleResetQueue}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium"
              title="Reset queue to default initial state"
            >
              Reset Queue
            </Button>
          </div>
        </div>

        {/* Visual Progression Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed</span>
              <span className="text-emerald-400 font-black text-base">
                {lastCompleted ? `${lastCompleted.tokenNumber} • ${lastCompleted.patientName}` : 'None yet'}
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <span className="text-emerald-300 block text-[10px] uppercase font-bold">In Consultation</span>
              <span className="text-white font-black text-base">
                {currentInConsult ? `${currentInConsult.tokenNumber} • ${currentInConsult.patientName}` : 'Room Idle'}
              </span>
            </div>
            <Stethoscope className="w-5 h-5 text-emerald-300 shrink-0 animate-pulse" />
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Next in Line (Waiting)</span>
              <span className="text-amber-300 font-black text-base">
                {nextWaiting ? `${nextWaiting.tokenNumber} • ${nextWaiting.patientName}` : 'Queue Empty'}
              </span>
            </div>
            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
          </div>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">
            Clinical Decision Support Notification
          </p>
          <p className="text-amber-800 leading-relaxed text-xs">
            AI-assisted information is provided as a draft for professional review. The healthcare
            professional remains responsible for clinical decisions.
          </p>
        </div>
      </div>

      {/* Metric Cards (Showing Waiting, In Consultation, Completed) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActiveSection("Today's Queue")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === "Today's Queue"
              ? 'bg-ayush-primary text-white border-ayush-primary shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              Today's Queue
            </span>
            <Users className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black mt-2">{totalCount}</div>
          <span className="text-[11px] opacity-75">All patients</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('Waiting Patients')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'Waiting Patients'
              ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              Waiting
            </span>
            <Clock className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black mt-2 text-sky-600 group-hover:text-sky-700 active-text">
            {waitingCount}
          </div>
          <span className="text-[11px] opacity-75">In waiting lounge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('In Consultation')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'In Consultation'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              In Consultation
            </span>
            <Stethoscope className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black mt-2 text-amber-600">
            {inProgressCount}
          </div>
          <span className="text-[11px] opacity-75">Inside Room 14</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('Completed')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'Completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider opacity-80">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-600">
            {completedCount}
          </div>
          <span className="text-[11px] opacity-75">Signed & archived</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('Urgent Review')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            activeSection === 'Urgent Review'
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
              : 'bg-rose-50/50 border-rose-200 hover:border-rose-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-700">
              Urgent Review
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black mt-2 text-rose-600">
            {urgentCount}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold">
            Red-flag / Priority triage
          </span>
        </button>
      </div>

      {/* Section Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              "Today's Queue",
              'Waiting Patients',
              'In Consultation',
              'Completed',
              'Urgent Review',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSection(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeSection === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, symptom, token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-ayush-primary"
          />
        </div>
      </div>

      {/* Queue List Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{activeSection}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              {filteredPatients.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Inspect AYUSH Pariksha findings, manage token progression, and sign off the consultation.
          </p>
        </div>
      </div>

      {/* Patients Queue Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No patients in this section</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or switch to "Today's Queue" to view all records.
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isRedFlag = patient.priority === 'Red-Flag'
            const isAnanya = patient.id === 'pat-042' || patient.tokenNumber === 'A-042'
            const isInConsult = patient.status === 'In Consultation'

            return (
              <Card
                key={patient.id}
                variant="interactive"
                className={`transition-all ${
                  isRedFlag
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                    : isInConsult
                    ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/20'
                    : isAnanya
                    ? 'border-ayush-primary/40 bg-ayush-surface/30 hover:border-ayush-primary'
                    : 'hover:border-ayush-primary'
                }`}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left Bio Section */}
                    <div className="flex items-start gap-4">
                      {/* Token Tile */}
                      <div
                        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 shadow-xs ${
                          isRedFlag
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isInConsult
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white text-ayush-primary border border-ayush-border'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400">Token</span>
                        <span className="text-xl font-black tracking-tight">{patient.tokenNumber}</span>
                      </div>

                      {/* Bio Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {patient.patientName}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {patient.age}Y • {patient.gender}
                          </span>

                          {/* Status Badge */}
                          <Badge
                            variant={
                              patient.status === 'In Consultation'
                                ? 'warning'
                                : patient.status === 'Completed'
                                ? 'default'
                                : 'ayush'
                            }
                            size="sm"
                          >
                            {patient.status}
                          </Badge>

                          {/* Returning Patient Badge */}
                          {patient.isReturningPatient && (
                            <Badge variant="ayush" size="sm">
                              Returning Patient
                            </Badge>
                          )}

                          {/* Dosha Badge */}
                          <Badge variant="outline" size="sm">
                            {patient.dominantDosha}
                          </Badge>

                          {/* Red Flag Status */}
                          {isRedFlag ? (
                            <Badge variant="danger" size="sm">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Urgent Red-Flag Alert
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm" className="bg-slate-100 text-slate-600">
                              Red Flag: {patient.redFlagStatus || 'Clear'}
                            </Badge>
                          )}
                        </div>

                        {/* Chief Concern */}
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          <span className="text-slate-400 font-semibold uppercase text-[11px] mr-1.5">
                            Chief Concern:
                          </span>
                          {patient.chiefComplaint}
                        </p>

                        {/* Status, History Completion & Summary Readiness Grid */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Checked in: {patient.intakeTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">History:</span>
                            <span className="font-bold text-slate-800">
                              {patient.historyCompletion || '100%'}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">Summary:</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                patient.summaryReadiness === 'Ready for Review'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : patient.summaryReadiness === 'Urgent Review Needed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : patient.summaryReadiness === 'In Consultation'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {patient.summaryReadiness || 'Ready for Review'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto shrink-0">
                      {/* Individual Status Progression Controls */}
                      {patient.status === 'Waiting' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updatePatientStatus(patient.id, 'In Consultation')
                            toast({
                              title: `Token ${patient.tokenNumber} Called`,
                              message: `${patient.patientName} called into consultation room.`,
                              type: 'info',
                            })
                          }}
                          leftIcon={<Stethoscope className="w-3.5 h-3.5 text-amber-600" />}
                        >
                          Call to Consult
                        </Button>
                      )}

                      {patient.status === 'In Consultation' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            updatePatientStatus(patient.id, 'Completed')
                            toast({
                              title: `Token ${patient.tokenNumber} Completed`,
                              message: `Consultation finalized and signed.`,
                              type: 'success',
                            })
                          }}
                          leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                        >
                          Mark Completed
                        </Button>
                      )}

                      {patient.status === 'Completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updatePatientStatus(patient.id, 'Waiting')
                            toast({
                              title: `Token ${patient.tokenNumber} Re-queued`,
                              message: `Patient returned to waiting list.`,
                              type: 'info',
                            })
                          }}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                        >
                          Re-queue
                        </Button>
                      )}

                      <Link to={`/doctor/patient/${patient.id}`}>
                        <Button
                          variant={isRedFlag ? 'danger' : 'primary'}
                          size="md"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Review & Verify
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
