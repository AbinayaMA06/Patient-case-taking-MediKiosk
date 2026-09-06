import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-slate-800 antialiased">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}
