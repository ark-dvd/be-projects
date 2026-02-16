'use client'

import { useState, useCallback } from 'react'
import { Phone, FileText } from 'lucide-react'
import {
  useSettingsManager,
  AccordionSection,
  Toast,
  SettingsSkeleton,
  SettingsError,
  SaveAllButton,
} from './settings-shared'

const SECTIONS = [
  { id: 'page-content', name: 'Contact Page Content', icon: FileText },
  { id: 'contact', name: 'Contact Details', icon: Phone },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function ContactPageTab() {
  const {
    settings,
    setSettings,
    originalSettings,
    isLoading,
    error,
    isSaving,
    savingSection,
    toast,
    setToast,
    fetchSettings,
    handleSave,
  } = useSettingsManager()

  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    () => new Set<SectionId>(['page-content'])
  )

  const sectionHasChanges = useCallback(
    (sectionId: SectionId): boolean => {
      switch (sectionId) {
        case 'page-content':
          return (
            settings.contactPageHeadline !== originalSettings.contactPageHeadline ||
            settings.contactPageDescription !== originalSettings.contactPageDescription
          )
        case 'contact':
          return (
            settings.phone !== originalSettings.phone ||
            settings.email !== originalSettings.email ||
            settings.address !== originalSettings.address ||
            settings.serviceArea !== originalSettings.serviceArea ||
            settings.officeHours !== originalSettings.officeHours
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
      {/* Contact Page Content */}
      <AccordionSection
        title="Contact Page Content"
        icon={FileText}
        isOpen={openSections.has('page-content')}
        onToggle={() => toggleSection('page-content')}
        hasChanges={sectionHasChanges('page-content')}
        isSaving={savingSection === 'page-content'}
        onSave={() => handleSave('page-content', 'Contact Page Content')}
      >
        <p className="text-sm text-gray-500 mb-4">
          Customize the headline and description shown at the top of the Contact page. Leave blank to use defaults.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Headline
          </label>
          <input
            type="text"
            value={settings.contactPageHeadline || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, contactPageHeadline: e.target.value }))
            }
            placeholder="Get In Touch"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={settings.contactPageDescription || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, contactPageDescription: e.target.value }))
            }
            placeholder="Ready to start your project? We'd love to hear from you."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
        </div>
      </AccordionSection>

      {/* Contact Details */}
      <AccordionSection
        title="Contact Details"
        icon={Phone}
        isOpen={openSections.has('contact')}
        onToggle={() => toggleSection('contact')}
        hasChanges={sectionHasChanges('contact')}
        isSaving={savingSection === 'contact'}
        onSave={() => handleSave('contact', 'Contact Details')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={settings.phone || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="contact@yourcompany.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={settings.address || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, address: e.target.value }))
            }
            rows={2}
            placeholder={"123 Main Street\nAustin, TX 78701"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Area
          </label>
          <input
            type="text"
            value={settings.serviceArea || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, serviceArea: e.target.value }))
            }
            placeholder="e.g., Greater Austin Area"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Office Hours
          </label>
          <textarea
            value={settings.officeHours || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, officeHours: e.target.value }))
            }
            rows={3}
            placeholder={"Mon-Fri: 8am-6pm\nSat: 9am-2pm\nSun: Closed"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
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
