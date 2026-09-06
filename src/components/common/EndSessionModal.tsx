import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { usePatientSession } from '@/context/PatientSessionContext'
import { useSystem } from '@/context/SystemContext'
import { useToast } from '@/hooks/useToast'

export function EndSessionModal() {
  const navigate = useNavigate()
  const { resetSession } = usePatientSession()
  const { isEndSessionModalOpen, closeEndSessionModal } = useSystem()
  const { toast } = useToast()

  const handleConfirmEndSession = () => {
    // 1. Reset patient session state
    resetSession()

    // 2. Clear prototype storage keys
    try {
      sessionStorage.removeItem('medikiosk_patient_session_v1')
      sessionStorage.removeItem('medikiosk_jihva_assessment_v1')
      sessionStorage.removeItem('medikiosk_nadi_assessment_v1')
      sessionStorage.removeItem('medikiosk_documents_v1')
    } catch {
      // Ignore
    }

    // 3. Close modal
    closeEndSessionModal()

    // 4. Show confirmation notification
    toast({
      title: 'Session Ended Securely',
      message: 'Temporary patient intake data has been erased from this terminal.',
      type: 'success',
    })

    // 5. Navigate to Home
    navigate('/')
  }

  return (
    <Modal
      isOpen={isEndSessionModalOpen}
      onClose={closeEndSessionModal}
      title="End Session & Purge Terminal Data"
      description="Safely conclude the consultation intake and sanitize terminal memory."
      size="md"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-900">Are you sure you want to end this session?</p>
            <p className="text-rose-800 leading-relaxed text-xs">
              This action clears all active demographic entries, clinical responses, and uploaded
              documents from this device. Once cleared, no patient information remains visible on
              this kiosk screen.
            </p>
          </div>
        </div>

        {/* Security & DPDP Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Kiosk Hygiene & DPDP Compliance</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Production deployment should implement ABDM/ABHA authentication, granular consent,
            DPDP-compliant data handling, encryption, audit logging, and secure session management.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={closeEndSessionModal}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleConfirmEndSession}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Confirm & End Session
          </Button>
        </div>
      </div>
    </Modal>
  )
}
