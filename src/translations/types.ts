export type SupportedLanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'other'

export interface TranslationSchema {
  langCode: SupportedLanguageCode
  langName: string
  nativeName: string
  
  common: {
    continue: string
    back: string
    next: string
    previous: string
    nextStep: string
    submit: string
    review: string
    edit: string
    save: string
    tryAgain: string
    useAnswer: string
    speakAnswer: string
    listening: string
    stopListening: string
    cancel: string
    confirm: string
    close: string
    needHelp: string
    voiceGuidance: string
    largerText: string
    highContrast: string
    exitDemo: string
    stepOf: (current: number, total: number) => string
    percentComplete: (pct: number) => string
    optional: string
    required: string
    yes: string
    no: string
    notSure: string
    changed: string
    noChange: string
    other: string
    clear: string
    safetyNotice?: string
    autonomousDisclaimer?: string
    aiDraftDisclaimer?: string
    confidence?: string
    complete?: string
  }

  stepper: {
    identify: { title: string; subtitle: string }
    consent: { title: string; subtitle: string }
    language: { title: string; subtitle: string }
    history: { title: string; subtitle: string }
    ayush: { title: string; subtitle: string }
    jihva: { title: string; subtitle: string }
    nadi: { title: string; subtitle: string }
    documents: { title: string; subtitle: string }
    summary: { title: string; subtitle: string }
    token: { title: string; subtitle: string }
  }

  consent: {
    badge: string
    securityTag: string
    title: string
    subtitle: string
    whyCollectTitle: string
    whyCollectDesc: string
    howUsedTitle: string
    howUsedDesc: string
    yourControlTitle: string
    yourControlDesc: string
    aiAssistanceTitle: string
    aiAssistanceDesc: string
    disclaimerTitle: string
    disclaimerDesc: string
    audioTitle: string
    audioDesc: string
    audioPlaying: (seconds: number) => string
    audioBadge: string
    requiredConsent: string
    aiConsent: string
    validationWarning: string
  }

  language: {
    badge: string
    tag: string
    title: string
    subtitle: string
    selectedConfirmation: (langName: string) => string
    answerInLanguage: (langName: string) => string
    simulationNotice: (langName: string) => string
    otherNotice: string
    continueToHistory: string
  }

  caregiver: {
    bannerTitle: string
    bannerDesc: string
    answeringFor: (patientName: string) => string
    relationshipLabel: string
    relationships: {
      parent: string
      familyMember: string
      caregiver: string
      other: string
    }
    answeringOnBehalf?: string
    recordedAsReported?: string
  }

  redFlags: {
    bannerTitle: string
    defaultWarning: string
    cardiorespiratory: string
    severeChest: string
    suddenOnset: string
    triageAdvice: string
    iUnderstand: string
    alertBannerTitle?: string
    highlightStaff?: string
    disclaimer?: string
    alertStaffButton?: string
    acknowledgeButton?: string
  }

  history: {
    badge: string
    tag: string
    conversationLanguage: string
    stepIndicator: (step: number, total: number) => string
    typeOrSpeak: string
    listeningStatus: string
    tapToRecord: string
    simulatedSpeechLabel: string
    completedTitle: string
    completedSubtitle: string
    reviewAnswers: string
    proceedToAyush: string
    chiefConcernLabel: string
    voiceListening?: string
    title?: string
    subtitle?: string
    quickAnswersTitle?: string
    typeSpecificResponse?: string
    typePlaceholder?: string
    voiceTitle?: string
    voiceRecordingNotice?: string
    voiceSimPrompt?: string
    voiceTag?: string
    simulatedTranscriptLabel?: string
    useThisAnswer?: string
    tryAgain?: string
    previousQuestion?: string
    completeReview?: string
    nextQuestion?: string
    historyCaptured?: string
    socratesGuideline?: string
    readyAyush?: string
    structuredFindings?: string
    clickEditHint?: string
    reviewAnswersTitle?: string
    revisitInterview?: string
    reviewFromQ1?: string
    continueAyush?: string
    aiAssistedQuestion?: string
    reading?: string
    listen?: string
    questions: {
      concern: {
        label: string
        question: string
        voiceSimulation: string
      }
      location: {
        label: string
        question: string
        painQuestion: string
        headacheQuestion: string
        coughQuestion: string
        voiceSimulation: string
      }
      duration: {
        label: string
        question: (location: string) => string
        voiceSimulation: string
      }
      character: {
        label: string
        question: string
        voiceSimulation: string
      }
      severity: {
        label: string
        question: string
        voiceSimulation: string
      }
      sudden_severity: {
        label: string
        question: string
        voiceSimulation: string
      }
      factors: {
        label: string
        question: string
        voiceSimulation: string
      }
      radiation: {
        label: string
        question: string
        voiceSimulation: string
      }
      previous: {
        label: string
        question: string
        voiceSimulation: string
      }
      associated: {
        label: string
        question: string
        voiceSimulation: string
      }
    }
    quickAnswers: Record<string, string>
  }

  ayush: {
    badge: string
    tag: string
    title: string
    subtitle: string
    deltaNotice: string
    deltaTitle: string
    deltaSubtitle: string
    prakritiTitle: string
    prakritiSubtitle: string
    agniTitle: string
    aharaTitle: string
    viharaTitle: string
    sleepTitle: string
    stressTitle: string
    options: Record<string, string>
    continueToJihva: string
  }

  jihva: {
    badge: string
    title: string
    subtitle: string
    cameraGuide: string
    captureBtn: string
    recaptureBtn: string
    coatingLabel: string
    moistureLabel: string
    cracksLabel: string
    amaLabel: string
    continueToNadi: string
    options: Record<string, string>
  }

  nadi: {
    badge: string
    title: string
    subtitle: string
    sensorPrompt: string
    placeFinger: string
    pulseRate: string
    rhythm: string
    velocity: string
    strength: string
    continueToDocs: string
    options: Record<string, string>
  }

  documents: {
    badge: string
    title: string
    subtitle: string
    uploadGuide: string
    dragDropText: string
    browseFiles: string
    ocrStatus: string
    continueToSummary: string
    types: Record<string, string>
  }

  summary: {
    badge: string
    title: string
    subtitle: string
    bilingualToggle: string
    verifiedCount: string
    accuracyNotice: string
    confirmAndSubmit: string
    sections: Record<string, string>
    fields: Record<string, { label: string; value: string }>
  }

  token: {
    badge: string
    title: string
    subtitle: string
    tokenNumberLabel: string
    roomLabel: string
    estimatedWait: string
    patientName: string
    abhaLabel: string
    printNotice: string
    returnHome: string
    currentToken?: string
    nowCalling?: string
    yourToken?: string
    yourTurn?: string
    patientsAhead?: string
    viewQueue?: string
    finishSession?: string
    printTicket?: string
  }
}
