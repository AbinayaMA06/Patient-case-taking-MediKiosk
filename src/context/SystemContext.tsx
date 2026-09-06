import React, { createContext, useContext, useState, useEffect } from 'react'
import type { PatientQueueItem } from '@/types'

export type OfflineState = 'Online' | 'Offline' | 'Sync pending' | 'Synced'

export interface AdminAnalyticsData {
  todaysPatients: number
  completedAssessments: number
  avgIntakeTimeMinutes: number
  returningPatients: number
  returningPatientsPct: number
  newPatients: number
  newPatientsPct: number
  caregiverSessions: number
  caregiverSessionsPct: number
  redFlagsDetected: number
  documentsProcessed: number
  hourlyVolume: { hour: string; count: number }[]
  stageDurations: { stage: string; minutes: number }[]
  languageDistribution: { language: string; count: number; pct: number }[]
  documentTypes: { type: string; count: number; pct: number }[]
  redFlagCategories: { category: string; count: number; severity: 'Critical' | 'Urgent' }[]
}

const INITIAL_QUEUE_DATA: PatientQueueItem[] = [
  {
    id: 'pat-040',
    tokenNumber: 'A-040',
    patientName: 'Devendra Joshi',
    age: 58,
    gender: 'Male',
    chiefComplaint: 'Vata Vyadhi (Lumbar spondylosis & lower back stiffness)',
    intakeTime: '09:40 AM',
    priority: 'Routine',
    dominantDosha: 'Vata',
    status: 'Completed',
    isReturningPatient: true,
    redFlagStatus: 'Clear',
    historyCompletion: '100%',
    summaryReadiness: 'Verified & Signed',
  },
  {
    id: 'pat-041',
    tokenNumber: 'A-041',
    patientName: 'Kavita Sundaram',
    age: 49,
    gender: 'Female',
    chiefComplaint: 'Amlapitta & Udarashoola (Acid regurgitation & epigastric burning)',
    intakeTime: '09:55 AM',
    priority: 'Routine',
    dominantDosha: 'Pitta',
    status: 'In Consultation',
    isReturningPatient: false,
    redFlagStatus: 'Clear',
    historyCompletion: '100%',
    summaryReadiness: 'In Consultation',
  },
  {
    id: 'pat-042',
    tokenNumber: 'A-042',
    patientName: 'Ananya Krishnan',
    age: 42,
    gender: 'Female',
    chiefComplaint: 'Janu Sandhigata Vata (Right knee swelling & morning stiffness)',
    intakeTime: '10:10 AM',
    priority: 'Routine',
    dominantDosha: 'Pitta-Kapha',
    status: 'Waiting',
    isReturningPatient: true,
    redFlagStatus: 'Clear',
    historyCompletion: '100%',
    summaryReadiness: 'Ready for Review',
  },
  {
    id: 'pat-043',
    tokenNumber: 'A-043',
    patientName: 'Harish Chandra',
    age: 64,
    gender: 'Male',
    chiefComplaint: 'Shwasa Roga (Chronic bronchial wheeze on mild exertion)',
    intakeTime: '10:18 AM',
    priority: 'Routine',
    dominantDosha: 'Vata-Kapha',
    status: 'Waiting',
    isReturningPatient: false,
    redFlagStatus: 'Clear',
    historyCompletion: '100%',
    summaryReadiness: 'Ready for Review',
  },
  {
    id: 'pat-044',
    tokenNumber: 'A-044',
    patientName: 'Gurpreet Singh',
    age: 62,
    gender: 'Male',
    chiefComplaint: 'Chest heaviness with radiating left shoulder discomfort',
    intakeTime: '10:25 AM',
    priority: 'Red-Flag',
    dominantDosha: 'Vata',
    status: 'Waiting',
    isReturningPatient: false,
    redFlagStatus: 'Urgent Red-Flag Alert',
    historyCompletion: '90%',
    summaryReadiness: 'Urgent Review Needed',
  },
  {
    id: 'pat-045',
    tokenNumber: 'A-045',
    patientName: 'Pooja Bhattacharya',
    age: 33,
    gender: 'Female',
    chiefComplaint: 'Nidranasa & Shirashoola (Insomnia with tension migraines)',
    intakeTime: '10:32 AM',
    priority: 'Routine',
    dominantDosha: 'Vata-Pitta',
    status: 'Waiting',
    isReturningPatient: true,
    redFlagStatus: 'Clear',
    historyCompletion: '100%',
    summaryReadiness: 'Ready for Review',
  },
]

export const DEMO_ADMIN_ANALYTICS: AdminAnalyticsData = {
  todaysPatients: 246,
  completedAssessments: 214,
  avgIntakeTimeMinutes: 4.2,
  returningPatients: 104,
  returningPatientsPct: 42.3,
  newPatients: 142,
  newPatientsPct: 57.7,
  caregiverSessions: 58,
  caregiverSessionsPct: 23.6,
  redFlagsDetected: 7,
  documentsProcessed: 189,
  hourlyVolume: [
    { hour: '8 AM', count: 18 },
    { hour: '9 AM', count: 42 },
    { hour: '10 AM', count: 56 },
    { hour: '11 AM', count: 48 },
    { hour: '12 PM', count: 34 },
    { hour: '1 PM', count: 22 },
    { hour: '2 PM', count: 26 },
  ],
  stageDurations: [
    { stage: 'Identify & ABHA', minutes: 0.8 },
    { stage: 'Clinical History', minutes: 1.4 },
    { stage: 'AYUSH Pariksha', minutes: 1.1 },
    { stage: 'Jihva & Nadi', minutes: 0.5 },
    { stage: 'Docs & Summary', minutes: 0.4 },
  ],
  languageDistribution: [
    { language: 'Hindi', count: 118, pct: 48 },
    { language: 'English', count: 54, pct: 22 },
    { language: 'Tamil', count: 32, pct: 13 },
    { language: 'Telugu', count: 24, pct: 10 },
    { language: 'Marathi', count: 18, pct: 7 },
  ],
  documentTypes: [
    { type: 'Prescriptions', count: 98, pct: 52 },
    { type: 'Lab Panels', count: 64, pct: 34 },
    { type: 'Discharge Summaries', count: 27, pct: 14 },
  ],
  redFlagCategories: [
    { category: 'Cardiac / Chest Tightness', count: 3, severity: 'Critical' },
    { category: 'Acute Respiratory Distress', count: 2, severity: 'Critical' },
    { category: 'Sudden Neurological Deficit', count: 2, severity: 'Urgent' },
  ],
}

export interface OperationalMetrics {
  patientVolumeToday: number
  averageIntakeDurationMinutes: number
  topComplaints: { complaint: string; count: number; percentage: string }[]
  redFlagTriageRate: string
  aiAssistanceAcceptanceRate: string
  terminalHealthStatus: string
}

export const DEMO_OPERATIONAL_METRICS: OperationalMetrics = {
  patientVolumeToday: 184,
  averageIntakeDurationMinutes: 4.2,
  topComplaints: [
    { complaint: 'Janu Sandhigata Vata (Osteoarthritis / Knee Stiffness)', count: 52, percentage: '28%' },
    { complaint: 'Amlapitta & Udarashoola (Hyperacidity & Dyspepsia)', count: 38, percentage: '21%' },
    { complaint: 'Shwasa Roga & Kasa (Chronic Bronchitis / Cough)', count: 29, percentage: '16%' },
    { complaint: 'Vata Vyadhi (Lumbar Spine & Sciatic Pain)', count: 24, percentage: '13%' },
    { complaint: 'Nidranasa (Insomnia & Stress Headache)', count: 18, percentage: '10%' },
  ],
  redFlagTriageRate: '4.3%',
  aiAssistanceAcceptanceRate: '96.8%',
  terminalHealthStatus: '100% Operational (6/6 Active)',
}

interface SystemContextValue {
  // Queue Management
  queue: PatientQueueItem[]
  userToken: string
  currentToken: string
  patientsAhead: number
  estimatedWaitMinutes: number
  progressQueue: () => void
  updatePatientStatus: (id: string, status: PatientQueueItem['status']) => void
  resetQueue: () => void

  // Offline Simulation
  isOffline: boolean
  offlineStatus: OfflineState
  pendingSyncCount: number
  toggleOfflineMode: () => void
  triggerManualSync: () => void

  // Privacy & Consent
  aiConsentGranted: boolean
  isAiAssistanceConsented: boolean
  clinicalConsentGranted: boolean
  revokeAiConsent: () => void
  grantAiConsent: () => void
  toggleAiConsent: () => void
  setAiAssistanceConsented: (consented: boolean) => void
  hasRevokedAiConsent: boolean

  // Operational & Admin Analytics (Segment 6)
  adminAnalytics: OperationalMetrics

  // Final Demo Mode (Segment 7)
  isDemoMode: boolean
  toggleDemoMode: () => void
  setDemoMode: (active: boolean) => void

  // End Session / Modal State
  isEndSessionModalOpen: boolean
  openEndSessionModal: () => void
  closeEndSessionModal: () => void
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined)

const QUEUE_STORAGE_KEY = 'medikiosk_queue_state_v1'
const OFFLINE_STORAGE_KEY = 'medikiosk_offline_mode_v1'
const AI_CONSENT_KEY = 'medikiosk_ai_consent_v1'
const DEMO_MODE_KEY = 'medikiosk_demo_mode_v1'

export function SystemProvider({ children }: { children: React.ReactNode }) {
  // Demo Mode State (Segment 7)
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(DEMO_MODE_KEY)
      return saved === 'true'
    } catch {
      return false
    }
  })
  // Queue State
  const [queue, setQueue] = useState<PatientQueueItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(QUEUE_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return INITIAL_QUEUE_DATA
  })

  // User's Demo Token is A-042 (as requested in Segment 6)
  const userToken = 'A-042'

  // Offline simulation state
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(OFFLINE_STORAGE_KEY)
      return saved === 'true'
    } catch {
      return false
    }
  })

  const [offlineStatus, setOfflineStatus] = useState<OfflineState>(() => {
    return isOffline ? 'Offline' : 'Online'
  })

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(isOffline ? 3 : 0)

  // AI Consent state
  const [aiConsentGranted, setAiConsentGranted] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(AI_CONSENT_KEY)
      if (saved !== null) return saved === 'true'
    } catch {
      // Ignore
    }
    return true
  })
  const [hasRevokedAiConsent, setHasRevokedAiConsent] = useState(false)
  const [clinicalConsentGranted] = useState(true)

  // End Session Modal
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false)

  // Persist Queue changes
  useEffect(() => {
    try {
      sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    } catch {
      // Ignore
    }
  }, [queue])

  // Persist Offline state
  useEffect(() => {
    try {
      sessionStorage.setItem(OFFLINE_STORAGE_KEY, String(isOffline))
    } catch {
      // Ignore
    }
  }, [isOffline])

  // Persist AI Consent
  useEffect(() => {
    try {
      sessionStorage.setItem(AI_CONSENT_KEY, String(aiConsentGranted))
    } catch {
      // Ignore
    }
  }, [aiConsentGranted])

  // Derive Current Calling Token
  const inConsultationPatient = queue.find((p) => p.status === 'In Consultation')
  const currentToken = inConsultationPatient ? inConsultationPatient.tokenNumber : 'A-041'

  // Derive Patients Ahead of A-042
  const userPatientIndex = queue.findIndex((p) => p.tokenNumber === userToken)
  const patientsAhead =
    userPatientIndex > -1
      ? queue
          .slice(0, userPatientIndex)
          .filter((p) => p.status === 'Waiting' || p.status === 'In Consultation').length
      : 2

  const estimatedWaitMinutes = Math.max(3, patientsAhead * 5)

  // Simulated Token Progression (Segment 6: A-041 -> Completed, A-042 -> In consultation, A-043 -> Waiting)
  const progressQueue = () => {
    setQueue((prevQueue) => {
      // Find current patient in consultation
      const currentInConsultIndex = prevQueue.findIndex((p) => p.status === 'In Consultation')

      if (currentInConsultIndex !== -1) {
        // Mark current as Completed
        const updated = [...prevQueue]
        updated[currentInConsultIndex] = {
          ...updated[currentInConsultIndex],
          status: 'Completed',
          summaryReadiness: 'Verified & Signed',
        }

        // Find next waiting patient
        const nextWaitingIndex = updated.findIndex((p) => p.status === 'Waiting')
        if (nextWaitingIndex !== -1) {
          updated[nextWaitingIndex] = {
            ...updated[nextWaitingIndex],
            status: 'In Consultation',
            summaryReadiness: 'In Consultation',
          }
        }
        return updated
      } else {
        // No one in consultation: pick first waiting
        const nextWaitingIndex = prevQueue.findIndex((p) => p.status === 'Waiting')
        if (nextWaitingIndex !== -1) {
          const updated = [...prevQueue]
          updated[nextWaitingIndex] = {
            ...updated[nextWaitingIndex],
            status: 'In Consultation',
            summaryReadiness: 'In Consultation',
          }
          return updated
        }
      }
      return prevQueue
    })
  }

  const updatePatientStatus = (id: string, status: PatientQueueItem['status']) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            summaryReadiness:
              status === 'Completed'
                ? 'Verified & Signed'
                : status === 'In Consultation'
                ? 'In Consultation'
                : 'Ready for Review',
          }
        }
        return item
      })
    )
  }

  const resetQueue = () => {
    setQueue(INITIAL_QUEUE_DATA)
  }

  // Toggle Offline Mode
  const toggleOfflineMode = () => {
    setIsOffline((prev) => {
      const next = !prev
      if (next) {
        setOfflineStatus('Offline')
        setPendingSyncCount(3)
      } else {
        setOfflineStatus('Sync pending')
        // Transition to synced after simulated sync delay
        setTimeout(() => {
          setOfflineStatus('Synced')
          setPendingSyncCount(0)
          setTimeout(() => {
            setOfflineStatus('Online')
          }, 2500)
        }, 1200)
      }
      return next
    })
  }

  const triggerManualSync = () => {
    if (isOffline) {
      // Cannot sync while offline
      return
    }
    setOfflineStatus('Sync pending')
    setTimeout(() => {
      setOfflineStatus('Synced')
      setPendingSyncCount(0)
      setTimeout(() => {
        setOfflineStatus('Online')
      }, 2500)
    }, 1200)
  }

  // AI Consent Revocation
  const revokeAiConsent = () => {
    setAiConsentGranted(false)
    setHasRevokedAiConsent(true)
  }

  const grantAiConsent = () => {
    setAiConsentGranted(true)
  }

  const toggleAiConsent = () => {
    if (aiConsentGranted) {
      revokeAiConsent()
    } else {
      grantAiConsent()
    }
  }

  const setDemoMode = (active: boolean) => {
    setIsDemoModeState(active)
    try {
      sessionStorage.setItem(DEMO_MODE_KEY, String(active))
    } catch {
      // Ignore
    }
  }

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode)
  }

  const openEndSessionModal = () => setIsEndSessionModalOpen(true)
  const closeEndSessionModal = () => setIsEndSessionModalOpen(false)

  return (
    <SystemContext.Provider
      value={{
        queue,
        userToken,
        currentToken,
        patientsAhead,
        estimatedWaitMinutes,
        progressQueue,
        updatePatientStatus,
        resetQueue,
        isOffline,
        offlineStatus,
        pendingSyncCount,
        toggleOfflineMode,
        triggerManualSync,
        aiConsentGranted,
        isAiAssistanceConsented: aiConsentGranted,
        clinicalConsentGranted,
        revokeAiConsent,
        grantAiConsent,
        toggleAiConsent,
        setAiAssistanceConsented: setAiConsentGranted,
        hasRevokedAiConsent,
        adminAnalytics: DEMO_OPERATIONAL_METRICS,
        isDemoMode,
        toggleDemoMode,
        setDemoMode,
        isEndSessionModalOpen,
        openEndSessionModal,
        closeEndSessionModal,
      }}
    >
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}
