import { ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSystem } from '@/context/SystemContext'
import { Link } from 'react-router-dom'

interface QueueBoardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QueueBoardModal({ isOpen, onClose }: QueueBoardModalProps) {
  const { queue, userToken, currentToken } = useSystem()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OPD Live Queue Board"
      description="Central AYUSH Hospital • Room 14 (Dr. Anand Kulkarni)"
      size="lg"
    >
      <div className="space-y-4">
        {/* Queue Overview Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <span className="text-[10px] uppercase font-bold text-sky-600 block">Now Calling</span>
            <div className="text-2xl font-black text-sky-900 mt-0.5">{currentToken}</div>
            <span className="text-[11px] text-sky-700 font-medium">In Consultation</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Your Token</span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{userToken}</div>
            <span className="text-[11px] text-emerald-800 font-bold">Assigned to You</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total in Queue</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">
              {queue.filter((q) => q.status === 'Waiting').length} Waiting
            </div>
            <span className="text-[11px] text-slate-500">OPD Session A</span>
          </div>
        </div>

        {/* List of Patients */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {queue.map((item) => {
            const isYou = item.tokenNumber === userToken
            const isCalling = item.status === 'In Consultation'

            return (
              <div
                key={item.id}
                className={`p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm transition-colors ${
                  isYou
                    ? 'bg-emerald-50/70 font-semibold'
                    : isCalling
                    ? 'bg-sky-50/50'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      isYou
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : isCalling
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.tokenNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.patientName}</span>
                      {isYou && (
                        <Badge variant="ayush" size="sm">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.chiefComplaint}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.status === 'In Consultation'
                        ? 'warning'
                        : item.status === 'Completed'
                        ? 'default'
                        : 'ayush'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link to="/doctor" onClick={onClose} className="text-xs text-slate-600 hover:text-ayush-primary flex items-center gap-1 font-semibold">
            <span>Switch to Doctor Queue Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Button variant="primary" size="sm" onClick={onClose}>
            Close Queue View
          </Button>
        </div>
      </div>
    </Modal>
  )
}
