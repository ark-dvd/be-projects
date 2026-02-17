'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Video,
  Trash2,
  X,
  Save,
  Loader2,
} from 'lucide-react'
import {
  useSettingsManager,
  AccordionSection,
  Toast,
  SettingsSkeleton,
  SettingsError,
  SaveAllButton,
} from './settings-shared'
import ImageUpload from './ImageUpload'

const SECTIONS = [
  { id: 'hero', name: 'Hero Section', icon: ImageIcon },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function HomePageTab() {
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
    () => new Set<SectionId>(['hero'])
  )

  const sectionHasChanges = useCallback(
    (sectionId: SectionId): boolean => {
      switch (sectionId) {
        case 'hero':
          return (
            settings.heroMediaType !== originalSettings.heroMediaType ||
            JSON.stringify(settings.heroImages) !== JSON.stringify(originalSettings.heroImages) ||
            settings.heroVideoUrl !== originalSettings.heroVideoUrl ||
            settings.heroHeadline !== originalSettings.heroHeadline ||
            settings.heroSubheadline !== originalSettings.heroSubheadline ||
            settings.heroCtaPrimaryText !== originalSettings.heroCtaPrimaryText ||
            settings.heroCtaSecondaryText !== originalSettings.heroCtaSecondaryText
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

  // Hero image management
  const removeHeroImage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index),
    }))
  }

  const updateHeroImageAlt = (index: number, alt: string) => {
    setSettings((prev) => ({
      ...prev,
      heroImages: prev.heroImages.map((img, i) =>
        i === index ? { ...img, alt } : img
      ),
    }))
  }

  if (isLoading) return <SettingsSkeleton />
  if (error) return <SettingsError error={error} onRetry={fetchSettings} />

  return (
    <div className="space-y-4 pb-24">
      <AccordionSection
        title="Hero Section"
        icon={ImageIcon}
        isOpen={openSections.has('hero')}
        onToggle={() => toggleSection('hero')}
        hasChanges={sectionHasChanges('hero')}
        isSaving={savingSection === 'hero'}
        onSave={() => handleSave('hero', 'Hero Section')}
      >
        {/* Hero Media Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Hero Media Type
          </label>
          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                settings.heroMediaType === 'images'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="heroMediaType"
                value="slider"
                checked={settings.heroMediaType === 'images'}
                onChange={() =>
                  setSettings((prev) => ({ ...prev, heroMediaType: 'images' }))
                }
                className="sr-only"
              />
              <ImageIcon
                className={`h-6 w-6 ${
                  settings.heroMediaType === 'images'
                    ? 'text-amber-600'
                    : 'text-gray-400'
                }`}
              />
              <span
                className={`font-medium ${
                  settings.heroMediaType === 'images'
                    ? 'text-amber-900'
                    : 'text-gray-600'
                }`}
              >
                Image Slider
              </span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                settings.heroMediaType === 'video'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="heroMediaType"
                value="video"
                checked={settings.heroMediaType === 'video'}
                onChange={() =>
                  setSettings((prev) => ({ ...prev, heroMediaType: 'video' }))
                }
                className="sr-only"
              />
              <Video
                className={`h-6 w-6 ${
                  settings.heroMediaType === 'video'
                    ? 'text-amber-600'
                    : 'text-gray-400'
                }`}
              />
              <span
                className={`font-medium ${
                  settings.heroMediaType === 'video'
                    ? 'text-amber-900'
                    : 'text-gray-600'
                }`}
              >
                Video Background
              </span>
            </label>
          </div>
        </div>

        {/* Image Slider Options */}
        {settings.heroMediaType === 'images' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Images
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Recommended: 3-5 high-quality images, 1920x1080 or larger
            </p>

            {settings.heroImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {settings.heroImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt || `Hero image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeHeroImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={image.alt || ''}
                      onChange={(e) => updateHeroImageAlt(index, e.target.value)}
                      placeholder="Alt text..."
                      className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <ImageUpload
              value={null}
              onUpload={(assetId, url) => {
                setSettings((prev) => ({
                  ...prev,
                  heroImages: [...prev.heroImages, { url, alt: '' }],
                }))
                setNewMediaUploads((prev) => ({
                  ...prev,
                  heroImages: [...(prev.heroImages || []), assetId],
                }))
              }}
              onRemove={() => {}}
              label="Add Hero Image"
            />
          </div>
        )}

        {/* Video Background Options */}
        {settings.heroMediaType === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Video
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Recommended: MP4 format, under 30MB, 15-30 seconds, no audio needed
            </p>

            {settings.heroVideoUrl ? (
              <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
                <video
                  src={settings.heroVideoUrl}
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, heroVideoUrl: '' }))
                  }
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ImageUpload
                value={null}
                onUpload={(assetId, url) => {
                  setSettings((prev) => ({ ...prev, heroVideoUrl: url }))
                  setNewMediaUploads((prev) => ({ ...prev, heroVideo: assetId }))
                }}
                onRemove={() => {}}
                label="Upload Hero Video"
                accept="video/*"
              />
            )}
          </div>
        )}

        {/* Hero Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Headline
          </label>
          <input
            type="text"
            value={settings.heroHeadline || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, heroHeadline: e.target.value }))
            }
            placeholder="e.g., Building Dreams, One Project at a Time"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subheadline
          </label>
          <textarea
            value={settings.heroSubheadline || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, heroSubheadline: e.target.value }))
            }
            rows={2}
            placeholder="e.g., Quality craftsmanship for your home renovation needs"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
        </div>

        {/* CTA Buttons */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">CTA Buttons</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Button Text
              </label>
              <input
                type="text"
                value={settings.heroCtaPrimaryText || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, heroCtaPrimaryText: e.target.value }))
                }
                placeholder="View Our Projects"
                maxLength={30}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Max 30 characters. Links to /projects</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={settings.heroCtaSecondaryText || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, heroCtaSecondaryText: e.target.value }))
                }
                placeholder="Get a Free Quote"
                maxLength={30}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Max 30 characters. Links to /contact</p>
            </div>
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
