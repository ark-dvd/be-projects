'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Palette,
  Share2,
  Shield,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from 'lucide-react'
import {
  useSettingsManager,
  AccordionSection,
  SocialField,
  Toast,
  SettingsSkeleton,
  SettingsError,
  SaveAllButton,
  US_STATES,
  YelpIcon,
  GoogleIcon,
  HouzzIcon,
  NextdoorIcon,
} from './settings-shared'
import ImageUpload from './ImageUpload'

const SECTIONS = [
  { id: 'branding', name: 'Branding', icon: Palette },
  { id: 'social', name: 'Social Media', icon: Share2 },
  { id: 'legal', name: 'Legal / License', icon: Shield },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function GlobalSettingsTab() {
  const {
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
  } = useSettingsManager()

  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    () => new Set<SectionId>(['branding'])
  )

  const sectionHasChanges = useCallback(
    (sectionId: SectionId): boolean => {
      switch (sectionId) {
        case 'branding':
          return (
            settings.logo !== originalSettings.logo ||
            settings.favicon !== originalSettings.favicon
          )
        case 'social':
          return (
            settings.instagram !== originalSettings.instagram ||
            settings.facebook !== originalSettings.facebook ||
            settings.linkedin !== originalSettings.linkedin ||
            settings.youtube !== originalSettings.youtube ||
            settings.yelp !== originalSettings.yelp ||
            settings.google !== originalSettings.google ||
            settings.houzz !== originalSettings.houzz ||
            settings.nextdoor !== originalSettings.nextdoor
          )
        case 'legal':
          return (
            settings.licenseNumber !== originalSettings.licenseNumber ||
            settings.licenseState !== originalSettings.licenseState ||
            settings.insuranceInfo !== originalSettings.insuranceInfo ||
            settings.bondInfo !== originalSettings.bondInfo ||
            settings.termsOfService !== originalSettings.termsOfService ||
            settings.privacyPolicy !== originalSettings.privacyPolicy
          )
        default:
          return false
      }
    },
    [settings, originalSettings]
  )

  const hasAnyChanges = SECTIONS.some((s) => sectionHasChanges(s.id))

  const toggleSection = (sectionId: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  if (isLoading) return <SettingsSkeleton />
  if (error) return <SettingsError error={error} onRetry={fetchSettings} />

  return (
    <div className="space-y-4 pb-24">
      {/* Branding */}
      <AccordionSection
        title="Branding"
        icon={Palette}
        isOpen={openSections.has('branding')}
        onToggle={() => toggleSection('branding')}
        hasChanges={sectionHasChanges('branding')}
        isSaving={savingSection === 'branding'}
        onSave={() => handleSave('branding', 'Branding')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ImageUpload
              value={settings.logo || null}
              onUpload={(assetId, url) => {
                setSettings((prev) => ({ ...prev, logo: url }))
                setNewMediaUploads((prev) => ({ ...prev, logo: assetId }))
              }}
              onRemove={() => setSettings((prev) => ({ ...prev, logo: '' }))}
              label="Logo"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended: PNG with transparent background, at least 200px wide
            </p>
            {settings.logo && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Header preview:</p>
                <Image
                  src={settings.logo}
                  alt="Logo preview"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <ImageUpload
              value={settings.favicon || null}
              onUpload={(assetId, url) => {
                setSettings((prev) => ({ ...prev, favicon: url }))
                setNewMediaUploads((prev) => ({ ...prev, favicon: assetId }))
              }}
              onRemove={() => setSettings((prev) => ({ ...prev, favicon: '' }))}
              label="Favicon"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended: Square image, 32x32 or 512x512 PNG
            </p>
            {settings.favicon && (
              <div className="mt-4 flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded">
                  <Image
                    src={settings.favicon}
                    alt="Favicon preview"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="text-xs text-gray-500">32px preview</span>
              </div>
            )}
          </div>
        </div>
      </AccordionSection>

      {/* Social Media */}
      <AccordionSection
        title="Social Media"
        icon={Share2}
        isOpen={openSections.has('social')}
        onToggle={() => toggleSection('social')}
        hasChanges={sectionHasChanges('social')}
        isSaving={savingSection === 'social'}
        onSave={() => handleSave('social', 'Social Media')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SocialField
            icon={Instagram}
            label="Instagram"
            value={settings.instagram}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, instagram: value }))
            }
            placeholder="https://instagram.com/yourcompany"
          />
          <SocialField
            icon={Facebook}
            label="Facebook"
            value={settings.facebook}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, facebook: value }))
            }
            placeholder="https://facebook.com/yourcompany"
          />
          <SocialField
            icon={Linkedin}
            label="LinkedIn"
            value={settings.linkedin}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, linkedin: value }))
            }
            placeholder="https://linkedin.com/company/yourcompany"
          />
          <SocialField
            icon={Youtube}
            label="YouTube"
            value={settings.youtube}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, youtube: value }))
            }
            placeholder="https://youtube.com/@yourcompany"
          />
          <SocialField
            icon={YelpIcon}
            label="Yelp"
            value={settings.yelp}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, yelp: value }))
            }
            placeholder="https://yelp.com/biz/yourcompany"
          />
          <SocialField
            icon={GoogleIcon}
            label="Google Business"
            value={settings.google}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, google: value }))
            }
            placeholder="https://g.page/yourcompany"
          />
          <SocialField
            icon={HouzzIcon}
            label="Houzz"
            value={settings.houzz}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, houzz: value }))
            }
            placeholder="https://houzz.com/pro/yourcompany"
          />
          <SocialField
            icon={NextdoorIcon}
            label="Nextdoor"
            value={settings.nextdoor}
            onChange={(value) =>
              setSettings((prev) => ({ ...prev, nextdoor: value }))
            }
            placeholder="https://nextdoor.com/pages/yourcompany"
          />
        </div>
      </AccordionSection>

      {/* Legal / License */}
      <AccordionSection
        title="Legal / License"
        icon={Shield}
        isOpen={openSections.has('legal')}
        onToggle={() => toggleSection('legal')}
        hasChanges={sectionHasChanges('legal')}
        isSaving={savingSection === 'legal'}
        onSave={() => handleSave('legal', 'Legal / License')}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            This information appears in your website footer for client trust and
            compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contractor License Number
            </label>
            <input
              type="text"
              value={settings.licenseNumber || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, licenseNumber: e.target.value }))
              }
              placeholder="e.g., TACLA12345C"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License State
            </label>
            <select
              value={settings.licenseState || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, licenseState: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
            >
              <option value="">Select state...</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Info
            </label>
            <input
              type="text"
              value={settings.insuranceInfo || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, insuranceInfo: e.target.value }))
              }
              placeholder="e.g., Fully insured, $2M liability"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bond Info (optional)
            </label>
            <input
              type="text"
              value={settings.bondInfo || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bondInfo: e.target.value }))
              }
              placeholder="e.g., $25,000 surety bond"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms of Service
            </label>
            <textarea
              value={settings.termsOfService || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, termsOfService: e.target.value }))
              }
              placeholder="Full Terms of Service text. Displayed on /terms page."
              rows={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Policy
            </label>
            <textarea
              value={settings.privacyPolicy || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, privacyPolicy: e.target.value }))
              }
              placeholder="Full Privacy Policy text. Displayed on /privacy page."
              rows={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-y"
            />
          </div>
        </div>
      </AccordionSection>

      {/* Save All Button */}
      <SaveAllButton
        isSaving={isSaving}
        hasAnyChanges={hasAnyChanges}
        onSave={() => handleSave()}
        sectionCount={SECTIONS.filter((s) => sectionHasChanges(s.id)).length}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
