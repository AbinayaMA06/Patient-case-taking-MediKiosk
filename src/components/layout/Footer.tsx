import { ShieldCheck, HeartHandshake, FileText, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function Footer() {
  return (
    <footer className="w-full bg-[#093322] text-white border-t border-emerald-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-emerald-900/60">
          {/* Col 1: Brand & Ministry */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌿</span>
              <span className="text-lg font-bold text-white tracking-tight">
                MediKiosk
              </span>
              <Badge variant="ayush" size="sm" className="bg-emerald-900/80 text-emerald-200 border-emerald-700">
                AYUSH Hospital Prototype
              </Badge>
            </div>
            <p className="text-xs text-emerald-200/80 max-w-md leading-relaxed">
              AI-Powered AYUSH Clinical History Platform. Developed for the Ministry of AYUSH under Smart India Hackathon (SIH 2026) to standardize clinical intake, automate Prakriti & Jihva Pariksha documentation, and empower healthcare practitioners.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-emerald-300/80">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ABDM Compatible
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> FHIR compliant
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-400" /> NAMASTE / ICD-11 Aligned
              </span>
            </div>
          </div>

          {/* Col 2: AYUSH Disciplines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              AYUSH Systems
            </h4>
            <ul className="text-xs text-emerald-100/70 space-y-1.5 font-medium">
              <li>Ayurveda (Prakriti / Agni / Dosha)</li>
              <li>Yoga & Naturopathy</li>
              <li>Unani (Mizaj / Akhlat)</li>
              <li>Siddha (Mukkuttram)</li>
              <li>Homeopathy</li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Terminal Access
            </h4>
            <ul className="text-xs text-emerald-100/70 space-y-1.5 font-medium">
              <li>
                <a href="/patient/identify" className="hover:text-white transition-colors flex items-center gap-1">
                  Patient Intake Terminal <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li>
                <a href="/doctor" className="hover:text-white transition-colors flex items-center gap-1">
                  Physician Summary Portal <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  Kiosk System Management <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">
                  Switch Portal Role
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>
            © 2026 Ministry of AYUSH, Government of India. Prototype for SIH 2026.
          </p>
          <p className="text-[11px] text-emerald-300/60 max-w-md sm:text-right">
            Clinical AI acts as an assistive intake tool. Final diagnosis and treatment decisions remain under the sole purview of qualified AYUSH clinicians.
          </p>
        </div>
      </div>
    </footer>
  )
}
