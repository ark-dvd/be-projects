'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  ExternalLink,
} from 'lucide-react'
import { adminFetch, adminPost, adminPut } from '@/lib/admin-api'

// ─── Types ───────────────────────────────────────────────────────────

export interface HeroImage {
  url: string
  alt: string
}

export interface Stat {
  value: string
  label: string
}

export interface TeamMember {
  name: string
  title: string
  subtitle: string
  focus: string
  photo?: string
  photoAssetId?: string
  linkedinUrl: string
  email: string
}

export interface SiteSettings {
  _id?: string
  // Hero Section
  heroMediaType: 'images' | 'video'
  heroImages: HeroImage[]
  heroVideoUrl?: string
  heroHeadline: string
  heroSubheadline: string
  // About / Company
  contractorName: string
  contractorTitle: string
  contractorPhoto?: string
  aboutHeadline: string
  aboutSubtitle: string
  aboutText: string
  aboutStats: Stat[]
  teamMembers: TeamMember[]
  teamClosingHeadline: string
  teamClosingText: string
  // Contact
  phone: string
  email: string
  address: string
  serviceArea: string
  officeHours: string
  // Branding
  logo?: string
  favicon?: string
  // Social Media
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  yelp: string
  google: string
  houzz: string
  nextdoor: string
  // Legal
  licenseNumber: string
  licenseState: string
  insuranceInfo: string
  bondInfo: string
  // Page Content
  projectsPageHeadline: string
  projectsPageDescription: string
  servicesPageHeadline: string
  servicesPageDescription: string
  testimonialsPageHeadline: string
  testimonialsPageDescription: string
  faqPageHeadline: string
  faqPageDescription: string
  contactPageHeadline: string
  contactPageDescription: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  heroMediaType: 'images',
  heroImages: [],
  heroVideoUrl: '',
  heroHeadline: '',
  heroSubheadline: '',
  contractorName: '',
  contractorTitle: '',
  contractorPhoto: '',
  aboutHeadline: '',
  aboutSubtitle: '',
  aboutText: '',
  aboutStats: [],
  teamMembers: [],
  teamClosingHeadline: '',
  teamClosingText: '',
  phone: '',
  email: '',
  address: '',
  serviceArea: '',
  officeHours: '',
  logo: '',
  favicon: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  youtube: '',
  yelp: '',
  google: '',
  houzz: '',
  nextdoor: '',
  licenseNumber: '',
  licenseState: '',
  insuranceInfo: '',
  bondInfo: '',
  projectsPageHeadline: '',
  projectsPageDescription: '',
  servicesPageHeadline: '',
  servicesPageDescription: '',
  testimonialsPageHeadline: '',
  testimonialsPageDescription: '',
  faqPageHeadline: '',
  faqPageDescription: '',
  contactPageHeadline: '',
  contactPageDescription: '',
}

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

// Track new media uploads (asset IDs) separately from existing URLs
export interface NewMediaUploads {
  contractorPhoto?: string
  logo?: string
  favicon?: string
  heroVideo?: string
  heroImages?: string[]
}

// ─── Toast Component ─────────────────────────────────────────────────

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Accordion Section Component ─────────────────────────────────────

export function AccordionSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  hasChanges,
  isSaving,
  onSave,
  children,
}: {
  title: string
  icon: React.ElementType
  isOpen: boolean
  onToggle: () => void
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
  children: React.ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
        hasChanges ? 'ring-2 ring-amber-300' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isOpen ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {hasChanges && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Unsaved
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 lg:px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
          {children}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSave()
              }}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save {title}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Social Media Field Component ────────────────────────────────────

export function SocialField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const safeValue = value || ''
  const isFilled = safeValue.trim().length > 0
  const isValidUrl = isFilled && (safeValue.startsWith('http://') || safeValue.startsWith('https://'))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative flex items-center gap-2">
        <div
          className={`p-2.5 rounded-lg ${
            isFilled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <input
          type="url"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
        />
        {isValidUrl && (
          <a
            href={safeValue}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Test link"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Custom SVG Icons ────────────────────────────────────────────────

export function YelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.14 11.18L9.24 6.16c-.48-.83-.14-1.52.76-1.52h4.4c.9 0 1.24.69.76 1.52l-2.9 5.02a.54.54 0 01-.12 0zm-.28 2.64l-5.1 2.94c-.83.48-1.52.14-1.52-.76v-4.4c0-.9.69-1.24 1.52-.76l5.1 2.94c.04.02.04.02 0 .04zm2.28 0l5.1-2.94c.83-.48 1.52-.14 1.52.76v4.4c0 .9-.69 1.24-1.52.76l-5.1-2.94c-.04-.02-.04-.02 0-.04zm-1-1.64l2.9-5.02c.48-.83 1.38-.83 1.86 0l2.9 5.02c.48.83.14 1.52-.76 1.52h-5.8c-.9 0-1.24-.69-.76-1.52h-.34zm0 3.64l-2.9 5.02c-.48.83-1.38.83-1.86 0l-2.9-5.02c-.48-.83-.14-1.52.76-1.52h5.8c.9 0 1.24.69.76 1.52h.34z" />
    </svg>
  )
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function HouzzIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5.5l7 4.04v8.92h-4.5v-5.5h-5v5.5H5v-8.92l7-4.04M12 2L2 7.77v12.46c0 .98.8 1.77 1.77 1.77h16.46c.98 0 1.77-.8 1.77-1.77V7.77L12 2z" />
    </svg>
  )
}

export function NextdoorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5h-9v-2h9v2zm0-4h-9v-2h9v2zm0-4h-9v-2h9v2z" />
    </svg>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Error Display ───────────────────────────────────────────────────

export function SettingsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Failed to Load Settings
      </h3>
      <p className="text-red-700 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// ─── Save All Button ─────────────────────────────────────────────────

export function SaveAllButton({
  isSaving,
  hasAnyChanges,
  onSave,
  sectionCount,
}: {
  isSaving: boolean
  hasAnyChanges: boolean
  onSave: () => void
  sectionCount: number
}) {
  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-8 z-40">
      <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <button
          onClick={onSave}
          disabled={isSaving || !hasAnyChanges}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl shadow-lg transition-all ${
            hasAnyChanges
              ? 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving All Settings...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save All Settings
              {hasAnyChanges && sectionCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {sectionCount} sections
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Settings Manager Hook ───────────────────────────────────────────

export function useSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [settingsExist, setSettingsExist] = useState(false)
  const [newMediaUploads, setNewMediaUploads] = useState<NewMediaUploads>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminFetch<Record<string, unknown>>('settings')
      const exists = !!(data && data._id)
      setSettingsExist(exists)
      const sanitized = Object.fromEntries(
        Object.entries(data || {}).filter(([, v]) => v !== null && v !== undefined)
      )
      // Map API response field names to frontend state field names
      if (sanitized.logoUrl && !sanitized.logo) sanitized.logo = sanitized.logoUrl
      if (sanitized.faviconUrl && !sanitized.favicon) sanitized.favicon = sanitized.faviconUrl
      if (sanitized.contractorPhotoUrl && !sanitized.contractorPhoto) sanitized.contractorPhoto = sanitized.contractorPhotoUrl
      if (sanitized.heroImageUrls && Array.isArray(sanitized.heroImageUrls)) {
        sanitized.heroImages = (sanitized.heroImageUrls as Array<Record<string, string>>).map(
          (img) => ({ url: img?.url || '', alt: img?.alt || '' })
        ).filter((img) => img.url)
      }
      if (sanitized.aboutStats && Array.isArray(sanitized.aboutStats)) {
        sanitized.aboutStats = (sanitized.aboutStats as Array<Record<string, string>>).map(
          (s) => ({ value: s?.value || '', label: s?.label || '' })
        )
      }
      if (sanitized.teamMembers && Array.isArray(sanitized.teamMembers)) {
        sanitized.teamMembers = (sanitized.teamMembers as Array<Record<string, string>>).map(
          (m) => ({
            name: m?.name || '',
            title: m?.title || '',
            subtitle: m?.subtitle || '',
            focus: m?.focus || '',
            photo: m?.photoUrl || '',
            photoAssetId: m?.photoAssetId || '',
            linkedinUrl: m?.linkedinUrl || '',
            email: m?.email || '',
          })
        )
      }
      const merged = { ...DEFAULT_SETTINGS, ...sanitized }
      setSettings(merged)
      setOriginalSettings(merged)
      setNewMediaUploads({})
    } catch (e) {
      if (e instanceof Error && e.message.includes('404')) {
        setSettingsExist(false)
        setSettings(DEFAULT_SETTINGS)
        setOriginalSettings(DEFAULT_SETTINGS)
        setNewMediaUploads({})
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load settings')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Build payload with all fields — only includes media when new uploads occurred
  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      _id: settings._id,
      heroMediaType: settings.heroMediaType,
      heroHeadline: settings.heroHeadline,
      heroSubheadline: settings.heroSubheadline,
      contractorName: settings.contractorName,
      contractorTitle: settings.contractorTitle,
      aboutHeadline: settings.aboutHeadline,
      aboutSubtitle: settings.aboutSubtitle,
      aboutText: settings.aboutText,
      aboutStats: settings.aboutStats,
      teamMembers: settings.teamMembers.map((m) => ({
        name: m.name,
        title: m.title,
        subtitle: m.subtitle,
        focus: m.focus,
        linkedinUrl: m.linkedinUrl,
        email: m.email,
        ...(m.photoAssetId ? { photo: { assetId: m.photoAssetId } } : {}),
      })),
      teamClosingHeadline: settings.teamClosingHeadline,
      teamClosingText: settings.teamClosingText,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      serviceArea: settings.serviceArea,
      officeHours: settings.officeHours,
      instagram: settings.instagram,
      facebook: settings.facebook,
      linkedin: settings.linkedin,
      youtube: settings.youtube,
      yelp: settings.yelp,
      google: settings.google,
      houzz: settings.houzz,
      nextdoor: settings.nextdoor,
      licenseNumber: settings.licenseNumber,
      licenseState: settings.licenseState,
      insuranceInfo: settings.insuranceInfo,
      bondInfo: settings.bondInfo,
      projectsPageHeadline: settings.projectsPageHeadline,
      projectsPageDescription: settings.projectsPageDescription,
      servicesPageHeadline: settings.servicesPageHeadline,
      servicesPageDescription: settings.servicesPageDescription,
      testimonialsPageHeadline: settings.testimonialsPageHeadline,
      testimonialsPageDescription: settings.testimonialsPageDescription,
      faqPageHeadline: settings.faqPageHeadline,
      faqPageDescription: settings.faqPageDescription,
      contactPageHeadline: settings.contactPageHeadline,
      contactPageDescription: settings.contactPageDescription,
    }

    // CRITICAL: Only include media fields if NEW uploads occurred
    if (newMediaUploads.heroVideo) payload.heroVideo = newMediaUploads.heroVideo
    if (newMediaUploads.heroImages && newMediaUploads.heroImages.length > 0) payload.heroImages = newMediaUploads.heroImages
    if (newMediaUploads.contractorPhoto) payload.contractorPhoto = newMediaUploads.contractorPhoto
    if (newMediaUploads.logo) payload.logo = newMediaUploads.logo
    if (newMediaUploads.favicon) payload.favicon = newMediaUploads.favicon

    return payload
  }

  // Save settings — optionally with section name for toast
  const handleSave = async (sectionId?: string, sectionName?: string) => {
    if (sectionId) {
      setSavingSection(sectionId)
    } else {
      setIsSaving(true)
    }
    try {
      const payload = buildPayload()
      if (settingsExist) {
        await adminPut('settings', payload)
      } else {
        await adminPost('settings', payload)
        setSettingsExist(true)
      }
      setOriginalSettings(settings)
      setNewMediaUploads({})
      setToast({
        message: sectionName ? `${sectionName} saved` : 'All settings saved successfully',
        type: 'success',
      })
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : 'Failed to save settings',
        type: 'error',
      })
    } finally {
      if (sectionId) {
        setSavingSection(null)
      } else {
        setIsSaving(false)
      }
    }
  }

  return {
    settings,
    setSettings,
    originalSettings,
    isLoading,
    error,
    isSaving,
    savingSection,
    newMediaUploads,
    setNewMediaUploads,
    toast,
    setToast,
    fetchSettings,
    handleSave,
  }
}
