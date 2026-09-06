import React, { createContext, useContext, useState, useEffect } from 'react'
import type {
  PatientSessionState,
  CaregiverRelationship,
  StructuredClinicalHistory,
  DeltaAssessmentState,
  AyushAssessmentState,
} from '@/types'

const STORAGE_KEY = 'medikiosk_patient_session_v1'

const INITIAL_DEMO_RETURNING_PATIENT: PatientSessionState = {
  patientType: 'returning',
  patientName: 'Ananya Krishnan',
  age: 42,
  gender: 'Female',
  dob: '1984-06-12',
  mobile: '+91 98450 12890',
  abhaId: 'XX-XXXX-XXXX-4821',
  lastVisit: '15 August 2026',
  isReturningPatient: true,
  isCaregiverSession: false,
  caregiverRelationship: undefined,
  reportedByCaregiver: false,
  consentGiven: false,
  aiConsentGiven: false,
  selectedLanguage: 'en',
  selectedLanguageName: 'English',
  previousAssessmentAvailable: true,
  previousAssessmentSummary: {
    lastVisit: '15 August 2026',
    condition: 'Kaphaja Kasa & Mandagni (Sub-acute cough and sluggish digestion)',
    prakriti: 'Pitta-Kapha',
    medications: ['Sitopaladi Churna 3g BD with honey', 'Trikatu Churna 1g before meals'],
  },
}

const DEFAULT_NEW_PATIENT: PatientSessionState = {
  patientType: 'new',
  patientName: '',
  age: '',
  gender: 'Female',
  mobile: '',
  abhaId: '',
  isReturningPatient: false,
  isCaregiverSession: false,
  caregiverRelationship: undefined,
  reportedByCaregiver: false,
  consentGiven: false,
  aiConsentGiven: false,
  selectedLanguage: 'en',
  selectedLanguageName: 'English',
  previousAssessmentAvailable: false,
}

interface PatientSessionContextValue {
  session: PatientSessionState
  setReturningDemoPatient: (isCaregiver?: boolean, relationship?: CaregiverRelationship) => void
  setNewPatientData: (data: {
    fullName: string
    ageOrDob: string
    gender: string
    mobile: string
    isCaregiver?: boolean
    relationship?: CaregiverRelationship
  }) => void
  setCaregiverProxy: (enabled: boolean, relationship?: CaregiverRelationship) => void
  setConsent: (requiredConsent: boolean, aiConsent: boolean) => void
  setLanguage: (code: string, name: string) => void
  setClinicalHistory: (history: StructuredClinicalHistory) => void
  setDeltaAssessment: (delta: DeltaAssessmentState) => void
  setAyushAssessment: (ayush: AyushAssessmentState) => void
  setReturningPatientMode: (isReturning: boolean) => void
  applyConsistentDemoData: () => void
  resetSession: () => void
}

const PatientSessionContext = createContext<PatientSessionContextValue | undefined>(undefined)

export function PatientSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PatientSessionState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Ignore sessionStorage read errors
    }
    return DEFAULT_NEW_PATIENT
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Ignore sessionStorage write errors
    }
  }, [session])

  const setReturningDemoPatient = (isCaregiver = false, relationship?: CaregiverRelationship) => {
    setSession({
      ...INITIAL_DEMO_RETURNING_PATIENT,
      isCaregiverSession: isCaregiver,
      reportedByCaregiver: isCaregiver,
      caregiverRelationship: isCaregiver ? relationship || 'Family Member' : undefined,
    })
  }

  const setNewPatientData = (data: {
    fullName: string
    ageOrDob: string
    gender: string
    mobile: string
    isCaregiver?: boolean
    relationship?: CaregiverRelationship
  }) => {
    const isAgeNumber = !isNaN(Number(data.ageOrDob))
    setSession((prev) => ({
      ...prev,
      patientType: 'new',
      patientName: data.fullName,
      age: isAgeNumber ? Number(data.ageOrDob) : data.ageOrDob,
      dob: !isAgeNumber ? data.ageOrDob : undefined,
      gender: data.gender,
      mobile: data.mobile,
      abhaId: undefined,
      lastVisit: undefined,
      isReturningPatient: false,
      isCaregiverSession: !!data.isCaregiver,
      reportedByCaregiver: !!data.isCaregiver,
      caregiverRelationship: data.isCaregiver ? data.relationship || 'Family Member' : undefined,
      previousAssessmentAvailable: false,
    }))
  }

  const setCaregiverProxy = (enabled: boolean, relationship?: CaregiverRelationship) => {
    setSession((prev) => ({
      ...prev,
      isCaregiverSession: enabled,
      reportedByCaregiver: enabled,
      caregiverRelationship: enabled ? relationship || prev.caregiverRelationship || 'Family Member' : undefined,
    }))
  }

  const setConsent = (requiredConsent: boolean, aiConsent: boolean) => {
    setSession((prev) => ({
      ...prev,
      consentGiven: requiredConsent,
      aiConsentGiven: aiConsent,
    }))
  }

  const setLanguage = (code: string, name: string) => {
    setSession((prev) => ({
      ...prev,
      selectedLanguage: code,
      selectedLanguageName: name,
    }))
  }

  const setClinicalHistory = (history: StructuredClinicalHistory) => {
    setSession((prev) => ({
      ...prev,
      clinicalHistory: history,
    }))
  }

  const setDeltaAssessment = (delta: DeltaAssessmentState) => {
    setSession((prev) => ({
      ...prev,
      deltaAssessment: delta,
    }))
  }

  const setAyushAssessment = (ayush: AyushAssessmentState) => {
    setSession((prev) => ({
      ...prev,
      ayushAssessment: ayush,
    }))
  }

  const setReturningPatientMode = (isReturning: boolean) => {
    setSession((prev) => ({
      ...prev,
      isReturningPatient: isReturning,
      patientType: isReturning ? 'returning' : 'new',
      patientName: isReturning ? (prev.patientName || 'Ananya Krishnan') : (prev.patientName === 'Ananya Krishnan' ? 'Rajesh Verma' : prev.patientName),
      previousAssessmentAvailable: isReturning,
      previousAssessmentSummary: isReturning
        ? (prev.previousAssessmentSummary || {
            lastVisit: '15 August 2026',
            condition: 'Sub-acute Joint Stiffness & Kaphaja Kasa',
            prakriti: 'Vata-Pitta',
            medications: ['Dashamoola Kashayam', 'Yogaraja Guggulu'],
          })
        : undefined,
    }))
  }

  const applyConsistentDemoData = () => {
    setSession({
      patientType: 'returning',
      patientName: 'Ananya Krishnan',
      age: 42,
      gender: 'Female',
      dob: '1984-06-12',
      mobile: '+91 98450 12890',
      abhaId: 'XX-XXXX-XXXX-4821',
      lastVisit: '15 August 2026',
      isReturningPatient: true,
      isCaregiverSession: false,
      caregiverRelationship: undefined,
      reportedByCaregiver: false,
      consentGiven: true,
      aiConsentGiven: true,
      selectedLanguage: 'en',
      selectedLanguageName: 'English',
      previousAssessmentAvailable: true,
      previousAssessmentSummary: {
        lastVisit: '15 August 2026',
        condition: 'Kaphaja Kasa & Mandagni (Sub-acute cough and sluggish digestion)',
        prakriti: 'Pitta-Kapha',
        medications: ['Sitopaladi Churna 3g BD with honey', 'Trikatu Churna 1g before meals'],
      },
      clinicalHistory: {
        chiefConcern: { value: 'Headache & right knee stiffness', confidence: 'High' },
        location: { value: 'Right Knee & Forehead', confidence: 'High' },
        onset: { value: 'Gradual onset over 3 months', confidence: 'High' },
        duration: { value: '3 months', confidence: 'High' },
        character: { value: 'Dull aching with morning stiffness 25 min', confidence: 'High' },
        severity: { value: 'Moderate', confidence: 'High' },
        aggravatingFactors: { value: 'Cold climate, prolonged standing, late-night working', confidence: 'High' },
        relievingFactors: { value: 'Warm sesame oil application (Til Taila), warm bath, rest', confidence: 'High' },
        associatedInformation: { value: 'Sleep reduced from 6 hours to 5 hours with occasional night waking', confidence: 'High' },
        redFlagsDetected: false,
        recordedAt: '05 September 2026',
      },
      deltaAssessment: {
        generalHealth: {
          status: 'Changed',
          detail: 'New concern: Headache with right knee morning stiffness',
          previousValue: 'Prior cough resolved',
          currentValue: 'Headache with right knee stiffness',
        },
        sleep: {
          status: 'Changed',
          detail: 'Sleep: 6 hours → 5 hours with occasional night waking',
          previousValue: '6 hours',
          currentValue: '5 hours',
        },
        appetite: {
          status: 'No change',
          detail: 'Appetite remains moderate with mild sluggishness (Mandagni)',
          previousValue: 'Moderate',
          currentValue: 'Moderate',
        },
        diet: {
          status: 'Changed',
          detail: 'Eating warmer, lighter cooked meals',
          previousValue: 'Mixed',
          currentValue: 'Warm light meals',
        },
        activity: {
          status: 'No change',
          detail: 'Occasional walking 3 times a week',
          previousValue: 'Occasional',
          currentValue: 'Occasional',
        },
        prakritiReview: 'No change',
        isCompleted: true,
      },
      ayushAssessment: {
        prakriti: 'Pitta-Kapha',
        prakritiStatus: 'baseline_preserved',
        vikriti: 'Vata dominant (joint ache & stiffness)',
        agni: 'Variable',
        ahara: 'Mixed',
        vihara: 'Light activity',
        sleep: '5–7 hours',
        stress: 'Moderate',
        dashavidha: {
          prakriti: 'Vata-Pitta (Previous baseline)',
          vikriti: 'Vata aggravation (Stiffness/Ache)',
          sara: 'Madhyama Sara (Moderate tissue vitality)',
          samhanana: 'Madhyama (Moderate symmetry & build)',
          pramana: 'Sama Pramana (Normal anthropometric balance)',
          satmya: 'Vyadhisatmya (Adapted to seasonal diet)',
          satva: 'Madhyama Satva (Moderate mental stamina)',
          ahara_shakti: 'Madhyama Shakti (Moderate capacity)',
          vyayama_shakti: 'Avara (Fatigues quickly with moderate stairs)',
          vaya: 'Madhyama Vaya (Adult, 30–50 yrs - Pitta stage)',
        },
      },
    })
  }

  const resetSession = () => {
    setSession(DEFAULT_NEW_PATIENT)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }

  return (
    <PatientSessionContext.Provider
      value={{
        session,
        setReturningDemoPatient,
        setNewPatientData,
        setCaregiverProxy,
        setConsent,
        setLanguage,
        setClinicalHistory,
        setDeltaAssessment,
        setAyushAssessment,
        setReturningPatientMode,
        applyConsistentDemoData,
        resetSession,
      }}
    >
      {children}
    </PatientSessionContext.Provider>
  )
}

export function usePatientSession() {
  const context = useContext(PatientSessionContext)
  if (!context) {
    throw new Error('usePatientSession must be used within a PatientSessionProvider')
  }
  return context
}
