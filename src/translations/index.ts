import { useMemo } from 'react'
import { usePatientSession } from '../context/PatientSessionContext'
import type { TranslationSchema, SupportedLanguageCode } from './types'
import { en } from './en'
import { hi } from './hi'
import { ta } from './ta'
import { te } from './te'
import { kn } from './kn'
import { ml } from './ml'
import { bn } from './bn'
import { mr } from './mr'

export * from './types'
export type { SupportedLanguageCode as SupportedLanguage }
export { en, hi, ta, te, kn, ml, bn, mr }

export interface LanguageOption {
  code: string
  name: string
  native: string
  dialectNote: string
}

export const LANGUAGES_LIST: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', dialectNote: 'Standard English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dialectNote: 'मानक हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', dialectNote: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', dialectNote: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', dialectNote: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', dialectNote: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', dialectNote: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', dialectNote: 'मराठी' },
  { code: 'other', name: 'Other', native: 'Other', dialectNote: 'Regional Dialect' },
]

export const translationsMap: Record<string, TranslationSchema> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
  mr,
}

export { translationsMap as TRANSLATIONS }

// Normalizes language code / name to valid dictionary key
export function normalizeLanguageCode(lang?: string): string {
  if (!lang) return 'en'
  const normalized = lang.trim().toLowerCase()

  if (translationsMap[normalized]) return normalized

  // Match by name
  if (normalized.startsWith('hi')) return 'hi'
  if (normalized.startsWith('ta')) return 'ta'
  if (normalized.startsWith('te')) return 'te'
  if (normalized.startsWith('kn') || normalized.startsWith('kan')) return 'kn'
  if (normalized.startsWith('ml') || normalized.startsWith('mal')) return 'ml'
  if (normalized.startsWith('bn') || normalized.startsWith('ben')) return 'bn'
  if (normalized.startsWith('mr') || normalized.startsWith('mar')) return 'mr'
  if (normalized.startsWith('en')) return 'en'

  return 'en'
}

export function getTranslation(lang?: string): TranslationSchema {
  const code = normalizeLanguageCode(lang)
  return translationsMap[code] || en
}

export function useTranslation() {
  const { session, setLanguage } = usePatientSession()
  const langCode = session?.selectedLanguage || 'en'
  const normalizedCode = normalizeLanguageCode(langCode)

  const t = useMemo(() => {
    return translationsMap[normalizedCode] || en
  }, [normalizedCode])

  const currentLangObj = useMemo(() => {
    return (
      LANGUAGES_LIST.find((l) => l.code === langCode || l.code === normalizedCode) ||
      LANGUAGES_LIST[0]
    )
  }, [langCode, normalizedCode])

  /**
   * Helper to translate a quick answer / clinical string to the current language.
   * If translation not found, safely returns the original key.
   */
  const tr = (englishKey: string): string => {
    if (!englishKey) return ''
    if (t.history?.quickAnswers?.[englishKey]) {
      return t.history.quickAnswers[englishKey]
    }
    if (t.ayush?.options?.[englishKey]) {
      return t.ayush.options[englishKey]
    }
    if (t.jihva?.options?.[englishKey]) {
      return t.jihva.options[englishKey]
    }
    if (t.nadi?.options?.[englishKey]) {
      return t.nadi.options[englishKey]
    }
    if (t.documents?.types?.[englishKey]) {
      return t.documents.types[englishKey]
    }
    return englishKey
  }

  const changeLanguage = (code: string, name?: string) => {
    const langObj = LANGUAGES_LIST.find((l) => l.code === code)
    setLanguage(code, name || langObj?.name || code)
  }

  return {
    t,
    currentLang: normalizedCode,
    currentLangName: currentLangObj.name,
    nativeLangName: currentLangObj.native,
    setLanguage: changeLanguage,
    tr,
  }
}
