import { Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { KioskLayout } from '@/layouts/KioskLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import {
  StepIdentify,
  StepConsent,
  StepLanguage,
  StepHistory,
  StepAyush,
  StepJihva,
  StepNadi,
  StepDocuments,
  StepSummary,
  StepToken,
} from '@/pages/patient/PatientSteps'
import { DoctorPortal } from '@/pages/doctor/DoctorPortal'
import { DoctorPatientDetail } from '@/pages/doctor/DoctorPatientDetail'
import { AdminPortal } from '@/pages/admin/AdminPortal'
import { ErrorState } from '@/components/ui/ErrorState'

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Layout Pages */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorPortal />} />
        <Route path="/doctor/patient/:id" element={<DoctorPatientDetail />} />
        <Route path="/doctor/verify/:id" element={<DoctorPatientDetail />} />
        <Route path="/doctor/verify" element={<DoctorPatientDetail />} />
        
        {/* Admin Route */}
        <Route path="/admin" element={<AdminPortal />} />
      </Route>

      {/* Patient Kiosk Layout Pages */}
      <Route path="/patient" element={<KioskLayout />}>
        <Route index element={<Navigate to="/patient/identify" replace />} />
        <Route path="identify" element={<StepIdentify />} />
        <Route path="consent" element={<StepConsent />} />
        <Route path="language" element={<StepLanguage />} />
        <Route path="history" element={<StepHistory />} />
        <Route path="ayush" element={<StepAyush />} />
        <Route path="jihva" element={<StepJihva />} />
        <Route path="nadi" element={<StepNadi />} />
        <Route path="documents" element={<StepDocuments />} />
        <Route path="summary" element={<StepSummary />} />
        <Route path="token" element={<StepToken />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF7]">
            <ErrorState
              title="Page Not Found"
              message="The requested terminal route does not exist. Please return to the MediKiosk homepage."
              showHomeButton
            />
          </div>
        }
      />
    </Routes>
  )
}
