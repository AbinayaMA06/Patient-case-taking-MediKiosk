export type UserRole = 'patient' | 'doctor' | 'admin' | 'caregiver'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
}

export type PatientJourneyStep =
  | 'identify'
  | 'consent'
  | 'language'
  | 'history'
  | 'ayush'
  | 'jihva'
  | 'nadi'
  | 'documents'
  | 'summary'
  | 'token'

export interface StepItem {
  id: PatientJourneyStep
  title: string
  subtitle: string
  path: string
  optional?: boolean
}

export type CaregiverRelationship =
  | 'Parent / Guardian'
  | 'Family Member'
  | 'Caregiver'
  | 'Other'

export interface HistoryFieldItem {
  value: string
  confidence: 'High' | 'Medium' | 'Low'
  notes?: string
}

export type ChangeStatus = 'No change' | 'Changed' | 'Not sure'

export interface DeltaItem {
  status: ChangeStatus
  detail?: string
  previousValue?: string
  currentValue?: string
}

export interface DeltaAssessmentState {
  generalHealth: DeltaItem
  appetite: DeltaItem
  sleep: DeltaItem
  diet: DeltaItem
  activity: DeltaItem
  prakritiReview: 'No change' | 'Needs reassessment'
  isCompleted?: boolean
}

export interface AyushAssessmentState {
  prakriti: string
  prakritiStatus: 'baseline_preserved' | 'reassessed' | 'pending_validation'
  vikriti: string
  agni: 'Regular' | 'Variable' | 'Low' | 'Strong' | 'Not sure'
  ahara: 'Vegetarian' | 'Non-vegetarian' | 'Mixed' | 'Other'
  vihara: 'Sedentary' | 'Light activity' | 'Moderate activity' | 'Highly active'
  sleep: 'Less than 5 hours' | '5–7 hours' | '7–9 hours' | 'More than 9 hours'
  stress: 'Low' | 'Moderate' | 'High' | 'Very high'
  dashavidha: Record<string, string>
}

export interface StructuredClinicalHistory {
  chiefConcern: HistoryFieldItem
  location: HistoryFieldItem
  onset: HistoryFieldItem
  duration: HistoryFieldItem
  character: HistoryFieldItem
  severity: HistoryFieldItem
  aggravatingFactors: HistoryFieldItem
  relievingFactors: HistoryFieldItem
  associatedInformation: HistoryFieldItem
  redFlagsDetected?: boolean
  redFlagWarning?: string
  recordedAt?: string
  reportedByCaregiver?: boolean
  caregiverRelationship?: string
}

export interface PatientSessionState {
  patientType: 'returning' | 'new' | 'guest'
  patientName: string
  age: number | string
  dob?: string
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say' | string
  mobile?: string
  abhaId?: string
  lastVisit?: string
  isReturningPatient: boolean
  isCaregiverSession: boolean
  caregiverRelationship?: CaregiverRelationship | string
  reportedByCaregiver: boolean
  consentGiven: boolean
  aiConsentGiven: boolean
  selectedLanguage: string
  selectedLanguageName?: string
  previousAssessmentAvailable?: boolean
  previousAssessmentSummary?: {
    lastVisit: string
    condition: string
    prakriti: string
    medications: string[]
  }
  clinicalHistory?: StructuredClinicalHistory
  deltaAssessment?: DeltaAssessmentState
  ayushAssessment?: AyushAssessmentState
}

export interface PatientDemographics {
  abhaId?: string
  fullName: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  mobile: string
  district: string
  state: string
  languagePreference: string
  isReturning: boolean
}

export interface ClinicalHistoryDraft {
  chiefComplaints: string[]
  duration: string
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Acute'
  associatedSymptoms: string[]
  pastIllnesses: string[]
  medications: string[]
  allergies: string[]
  redFlagsDetected: boolean
  redFlagNotes?: string
}

export interface AyushAssessmentDraft {
  dominantDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshic'
  prakritiScores: {
    vata: number
    pitta: number
    kapha: number
  }
  agniStatus: 'Sama' | 'Vishama' | 'Tikshna' | 'Manda'
  kosthaStatus: 'Mrudu' | 'Madhyama' | 'Krura'
  sleepPattern: string
  appetite: string
}

export interface JihvaParikshaDraft {
  coatingColor: 'White' | 'Yellow' | 'Brown' | 'Normal Pink'
  coatingThickness: 'Thin' | 'Moderate' | 'Heavy' | 'None'
  moisture: 'Dry' | 'Normal' | 'Excessively Wet'
  cracks: boolean
  scallopedEdges: boolean
  amaIndication: 'None' | 'Mild' | 'Moderate' | 'Severe'
  sampleImagePath?: string
}

export interface NadiParikshaDraft {
  gati: 'Sarpa (Cobra/Vata)' | 'Manduka (Frog/Pitta)' | 'Hamsa (Swan/Kapha)' | 'Mixed'
  rateBpm: number
  rhythm: 'Regular' | 'Irregular'
  vegaVelocity: 'Tivra (High)' | 'Madhyama (Medium)' | 'Manda (Slow)'
  balaStrength: 'Uttama (Strong)' | 'Madhyama (Moderate)' | 'Alpa (Weak)'
}

export interface MedicalDocumentDraft {
  id: string
  name: string
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other'
  date: string
  status: 'Parsed' | 'Processing' | 'Pending'
  extractedEntitiesCount: number
}

export interface PatientQueueItem {
  id: string
  tokenNumber: string
  patientName: string
  age: number
  gender: string
  chiefComplaint: string
  intakeTime: string
  priority: 'Routine' | 'Urgent' | 'Red-Flag'
  dominantDosha: string
  status: 'Waiting' | 'In Consultation' | 'Completed'
  isReturningPatient?: boolean
  redFlagStatus?: string
  historyCompletion?: string
  summaryReadiness?: string
}
