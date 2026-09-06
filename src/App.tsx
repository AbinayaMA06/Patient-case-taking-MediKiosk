import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/hooks/useToast'
import { PatientSessionProvider } from '@/context/PatientSessionContext'
import { SystemProvider } from '@/context/SystemContext'
import { EndSessionModal } from '@/components/common/EndSessionModal'
import { AppRoutes } from '@/routes/AppRoutes'

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PatientSessionProvider>
          <SystemProvider>
            <AppRoutes />
            <EndSessionModal />
          </SystemProvider>
        </PatientSessionProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
