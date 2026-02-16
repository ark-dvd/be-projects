'use client'

import { useState, useCallback } from 'react'
import {
  Building2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { TeamMember } from './settings-shared'
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
  { id: 'about', name: 'About / Company Info', icon: Building2 },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function AboutPageTab() {
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
    () => new Set<SectionId>(['about'])
  )

  const sectionHasChanges = useCallback(
    (sectionId: SectionId): boolean => {
      switch (sectionId) {
        case 'about':
          return (
            settings.contractorName !== originalSettings.contractorName ||
            settings.contractorTitle !== originalSettings.contractorTitle ||
            settings.contractorPhoto !== originalSettings.contractorPhoto ||
            settings.aboutHeadline !== originalSettings.aboutHeadline ||
            settings.aboutSubtitle !== originalSettings.aboutSubtitle ||
            settings.aboutText !== originalSettings.aboutText ||
            JSON.stringify(settings.aboutStats) !== JSON.stringify(originalSettings.aboutStats) ||
            JSON.stringify(settings.teamMembers) !== JSON.stringify(originalSettings.teamMembers) ||
            settings.teamClosingHeadline !== originalSettings.teamClosingHeadline ||
            settings.teamClosingText !== originalSettings.teamClosingText
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

  // Stats management
  const addStat = () => {
    setSettings((prev) => ({
      ...prev,
      aboutStats: [...prev.aboutStats, { value: '', label: '' }],
    }))
  }

  const removeStat = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      aboutStats: prev.aboutStats.filter((_, i) => i !== index),
    }))
  }

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    setSettings((prev) => ({
      ...prev,
      aboutStats: prev.aboutStats.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      ),
    }))
  }

  const moveStatUp = (index: number) => {
    if (index === 0) return
    setSettings((prev) => {
      const newStats = [...prev.aboutStats]
      ;[newStats[index - 1], newStats[index]] = [newStats[index], newStats[index - 1]]
      return { ...prev, aboutStats: newStats }
    })
  }

  const moveStatDown = (index: number) => {
    if (index === settings.aboutStats.length - 1) return
    setSettings((prev) => {
      const newStats = [...prev.aboutStats]
      ;[newStats[index], newStats[index + 1]] = [newStats[index + 1], newStats[index]]
      return { ...prev, aboutStats: newStats }
    })
  }

  // Team member management
  const addTeamMember = () => {
    setSettings((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          name: '',
          title: '',
          subtitle: '',
          focus: '',
          photo: '',
          photoAssetId: '',
          linkedinUrl: '',
          email: '',
        },
      ],
    }))
  }

  const removeTeamMember = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setSettings((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }))
  }

  if (isLoading) return <SettingsSkeleton />
  if (error) return <SettingsError error={error} onRetry={fetchSettings} />

  return (
    <div className="space-y-4 pb-24">
      <AccordionSection
        title="About / Company Info"
        icon={Building2}
        isOpen={openSections.has('about')}
        onToggle={() => toggleSection('about')}
        hasChanges={sectionHasChanges('about')}
        isSaving={savingSection === 'about'}
        onSave={() => handleSave('about', 'About / Company Info')}
      >
        {/* Company Name & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contractor / Company Name
            </label>
            <input
              type="text"
              value={settings.contractorName || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, contractorName: e.target.value }))
              }
              placeholder="e.g., Smith Construction"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title / Specialty
            </label>
            <input
              type="text"
              value={settings.contractorTitle || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, contractorTitle: e.target.value }))
              }
              placeholder="e.g., General Contractor | Kitchen & Bath Specialist"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Contractor Photo */}
        <ImageUpload
          value={settings.contractorPhoto || null}
          onUpload={(assetId, url) => {
            setSettings((prev) => ({ ...prev, contractorPhoto: url }))
            setNewMediaUploads((prev) => ({ ...prev, contractorPhoto: assetId }))
          }}
          onRemove={() => setSettings((prev) => ({ ...prev, contractorPhoto: '' }))}
          label="Photo (Headshot or Team)"
          className="max-w-md"
        />

        {/* About Headline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Headline
          </label>
          <input
            type="text"
            value={settings.aboutHeadline || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, aboutHeadline: e.target.value }))
            }
            placeholder="e.g., 20 Years of Excellence"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        {/* About Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Page Subtitle
          </label>
          <textarea
            value={settings.aboutSubtitle || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, aboutSubtitle: e.target.value }))
            }
            rows={3}
            placeholder="Displayed below the main headline on the About page"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
        </div>

        {/* About Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Text
          </label>
          <textarea
            value={settings.aboutText || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, aboutText: e.target.value }))
            }
            rows={10}
            placeholder="Tell your story... How did you get started? What makes your work special?"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
          />
        </div>

        {/* Stats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stats (displayed on About page)
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Examples: &quot;500+ Projects Completed&quot;, &quot;20 Years Experience&quot;, &quot;100% Satisfaction&quot;
          </p>

          <div className="space-y-3">
            {settings.aboutStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveStatUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStatDown(index)}
                    disabled={index === settings.aboutStats.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={stat.value || ''}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  placeholder="500+"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center font-semibold"
                />
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  placeholder="Projects Completed"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStat}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Stat
          </button>
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members (displayed on About page)
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Add team members or founders with their photo, role, and contact info.
          </p>

          <div className="space-y-4">
            {settings.teamMembers.map((member, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-900 text-sm">
                    {member.name || `Team Member ${index + 1}`}
                    {member.title && (
                      <span className="text-gray-500 font-normal"> — {member.title}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      placeholder="e.g., John Smith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Title / Role
                    </label>
                    <input
                      type="text"
                      value={member.title || ''}
                      onChange={(e) => updateTeamMember(index, 'title', e.target.value)}
                      placeholder="e.g., Co-Founder & CEO"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Subtitle / Credential
                    </label>
                    <input
                      type="text"
                      value={member.subtitle || ''}
                      onChange={(e) => updateTeamMember(index, 'subtitle', e.target.value)}
                      placeholder="e.g., Mechanical Engineer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={member.linkedinUrl || ''}
                      onChange={(e) => updateTeamMember(index, 'linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={member.email || ''}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      placeholder="john@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Photo
                    </label>
                    <ImageUpload
                      value={member.photo || null}
                      onUpload={(assetId, url) => {
                        setSettings((prev) => ({
                          ...prev,
                          teamMembers: prev.teamMembers.map((m, i) =>
                            i === index ? { ...m, photo: url, photoAssetId: assetId } : m
                          ),
                        }))
                      }}
                      onRemove={() => {
                        setSettings((prev) => ({
                          ...prev,
                          teamMembers: prev.teamMembers.map((m, i) =>
                            i === index ? { ...m, photo: '', photoAssetId: '' } : m
                          ),
                        }))
                      }}
                      label="Upload Photo"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Focus / Description
                  </label>
                  <textarea
                    value={member.focus || ''}
                    onChange={(e) => updateTeamMember(index, 'focus', e.target.value)}
                    rows={3}
                    placeholder="What this person focuses on..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTeamMember}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>

        {/* Team Closing Statement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Section Closing Headline
          </label>
          <input
            type="text"
            value={settings.teamClosingHeadline || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, teamClosingHeadline: e.target.value }))
            }
            placeholder="e.g., Built on Trust, Driven by Excellence"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Section Closing Text
          </label>
          <textarea
            value={settings.teamClosingText || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, teamClosingText: e.target.value }))
            }
            rows={4}
            placeholder="Body text displayed below the closing headline on the About page"
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
