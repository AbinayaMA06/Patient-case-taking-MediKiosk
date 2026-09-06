import { useState } from 'react'
import {
  CheckCircle2,
  Printer,
  Users,
  Building2,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useSystem } from '@/context/SystemContext'
import { useToast } from '@/hooks/useToast'
import { QueueBoardModal } from '@/components/common/QueueBoardModal'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'
import { useTranslation } from '@/translations'

export function StepToken() {
  const { session } = usePatientSession()
  const { t } = useTranslation()
  const {
    userToken,
    currentToken,
    patientsAhead,
    estimatedWaitMinutes,
    openEndSessionModal,
    isOffline,
  } = useSystem()
  const { toast } = useToast()

  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false)

  const patientDisplayName =
    session.patientName || (session.patientType === 'returning' ? 'Ananya Krishnan' : 'Rameshwar Sharma')
  const patientDisplayAge = session.age || 42
  const patientDisplayGender = session.gender || 'Female'

  const handlePrint = () => {
    toast({
      title: 'Printing Token Slip',
      message: `OPD Token ${userToken} thermal ticket sent to terminal printer.`,
      type: 'success',
    })
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Offline Status Alert if active */}
      {isOffline && <OfflineIndicator compact={false} showToggle={true} />}

      <Card variant="highlight" className="border-2 border-emerald-600/40 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <Badge variant="ayush" size="md" className="mx-auto">
            {t.token?.badge || 'Step 10 of 10 • Intake Successfully Registered'}
          </Badge>

          <CardTitle className="text-3xl mt-2 font-black text-slate-900 tracking-tight">
            {t.token?.title || 'Your consultation token'}
          </CardTitle>

          <CardDescription className="text-base text-slate-600 font-medium">
            {t.token?.subtitle || 'Please wait for your token to be called.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Queue Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Current Token */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-600 block">
                {t.token?.currentToken || 'Current Token'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-1">
                {currentToken}
              </div>
              <span className="text-[11px] text-sky-700 font-medium">{t.token?.nowCalling || 'Now Calling'}</span>
            </div>

            {/* Your Token */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                {t.token?.yourToken || 'Your Token'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
                {userToken}
              </div>
              <span className="text-[11px] text-emerald-800 font-bold">{t.token?.yourTurn || 'Your Turn'}</span>
            </div>

            {/* Patients Ahead */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">
                {t.token?.patientsAhead || 'Patients Ahead'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
                {patientsAhead}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                {patientsAhead === 1 ? 'patient' : 'patients'} waiting
              </span>
            </div>

            {/* Estimated Wait */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {t.token?.estimatedWait || 'Estimated Wait'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                ~{estimatedWaitMinutes}m
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Room #14</span>
            </div>
          </div>

          {/* Thermal Slip Simulation */}
          <div className="bg-[#FAF9F5] border-2 border-dashed border-slate-300 p-6 rounded-2xl font-mono text-center space-y-4 shadow-xs">
            <div className="border-b border-dashed border-slate-300 pb-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest text-slate-800 uppercase">
                <Building2 className="w-4 h-4 text-emerald-800" />
                <span>Ministry of AYUSH Central Hospital</span>
              </div>
              <p className="text-xs text-slate-500">OPD CLINICAL INTAKE KIOSK #4 • NEW DELHI</p>
              <p className="text-[11px] text-slate-400">Date: 05 Sep 2026 • Live Session</p>
            </div>

            <div className="py-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-sans font-bold">
                Assigned Consultation Slip
              </span>
              <div className="text-6xl font-black text-ayush-primary tracking-tight my-2">
                {userToken}
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                Room 14 • Dr. Anand Kulkarni (MD Ayu)
              </span>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-3 text-xs text-left text-slate-600 space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span>
                  <strong>Patient:</strong> {patientDisplayName} ({patientDisplayAge}
                  {patientDisplayGender[0]})
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  ABHA: {session.abhaId || 'XX-XXXX-XXXX-4821'}
                </span>
              </div>
              <div>
                <strong>Chief Concern:</strong>{' '}
                {session.clinicalHistory?.chiefConcern.value ||
                  'Janu Sandhigata Vata (Right knee swelling & morning stiffness)'}
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Status: In Queue</span>
                <span>Wait: ~{estimatedWaitMinutes} mins ({patientsAhead} ahead)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons as requested: "View Queue" and "Finish" */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="kiosk"
                onClick={() => setIsQueueModalOpen(true)}
                leftIcon={<Users className="w-5 h-5" />}
                className="w-full sm:w-1/2"
              >
                {t.token?.viewQueue || 'View Queue'}
              </Button>

              <Button
                variant="outline"
                size="kiosk"
                onClick={openEndSessionModal}
                leftIcon={<LogOut className="w-5 h-5 text-rose-600" />}
                className="w-full sm:w-1/2"
              >
                {t.token?.finishSession || 'Finish'}
              </Button>
            </div>

            {/* Print Slip Auxiliary */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-ayush-primary font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{t.token?.printTicket || 'Print Physical Paper Ticket'}</span>
              </button>
            </div>
          </div>

          {/* Security & Prototype Disclaimer Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Terminal Hygiene & Security:</span>
              <p className="text-slate-500">
                Production deployment should implement ABDM/ABHA authentication, granular consent,
                DPDP-compliant data handling, encryption, audit logging, and secure session
                management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Queue Modal */}
      <QueueBoardModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />
    </div>
  )
}
