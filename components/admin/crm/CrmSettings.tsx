'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Plus,
  X,
  GripVertical,
  RefreshCw,
  Settings,
  Palette,
  List,
  Sliders,
} from 'lucide-react'
import { fetchCrmSettings, updateCrmSettings, initializeCrmSettings, CrmSettings as CrmSettingsType, PipelineStage } from '@/lib/crm-api'

export default function CrmSettings() {
  const [settings, setSettings] = useState<CrmSettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Editable state
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [dealStatuses, setDealStatuses] = useState<PipelineStage[]>([])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [leadSources, setLeadSources] = useState<string[]>([])
  const [defaultPriority, setDefaultPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [dealLabel, setDealLabel] = useState('Project')
  const [currency, setCurrency] = useState('$')

  // New item inputs
  const [newServiceType, setNewServiceType] = useState('')
  const [newLeadSource, setNewLeadSource] = useState('')

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      let data = await fetchCrmSettings()

      // Initialize if not exists
      if (!data._id) {
        data = await initializeCrmSettings()
      }

      setSettings(data)
      setPipelineStages(data.pipelineStages || [])
      setDealStatuses(data.dealStatuses || [])
      setServiceTypes(data.serviceTypes || [])
      setLeadSources(data.leadSources || [])
      setDefaultPriority(data.defaultPriority || 'medium')
      setDealLabel(data.dealLabel || 'Project')
      setCurrency(data.currency || '$')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      await updateCrmSettings({
        pipelineStages,
        dealStatuses,
        serviceTypes,
        leadSources,
        defaultPriority,
        dealLabel,
        currency,
      })

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateStageColor = (stages: PipelineStage[], setStages: (s: PipelineStage[]) => void, index: number, color: string) => {
    const updated = [...stages]
    updated[index] = { ...updated[index], color }
    setStages(updated)
  }

  const updateStageLabel = (stages: PipelineStage[], setStages: (s: PipelineStage[]) => void, index: number, label: string) => {
    const updated = [...stages]
    updated[index] = { ...updated[index], label }
    setStages(updated)
  }

  const addServiceType = () => {
    if (!newServiceType.trim()) return
    setServiceTypes([...serviceTypes, newServiceType.trim()])
    setNewServiceType('')
  }

  const removeServiceType = (index: number) => {
    setServiceTypes(serviceTypes.filter((_, i) => i !== index))
  }

  const addLeadSource = () => {
    if (!newLeadSource.trim()) return
    setLeadSources([...leadSources, newLeadSource.trim()])
    setNewLeadSource('')
  }

  const removeLeadSource = (index: number) => {
    setLeadSources(leadSources.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">CRM Settings</h2>
          <p className="text-sm text-gray-500">Configure your CRM pipeline and options</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] disabled:opacity-50 transition-colors font-medium text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#fe5557]" />
          Lead Pipeline Stages
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Customize the stages leads move through in your pipeline.
        </p>
        <div className="space-y-2">
          {pipelineStages.map((stage, index) => (
            <div
              key={stage.key}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <input
                type="color"
                value={stage.color}
                onChange={(e) => updateStageColor(pipelineStages, setPipelineStages, index, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={stage.label}
                onChange={(e) => updateStageLabel(pipelineStages, setPipelineStages, index, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              />
              <span className="text-xs text-gray-400 w-20">{stage.key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Statuses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-[#fe5557]" />
          Project Statuses
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Customize the statuses for projects/deals.
        </p>
        <div className="space-y-2">
          {dealStatuses.map((status, index) => (
            <div
              key={status.key}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <input
                type="color"
                value={status.color}
                onChange={(e) => updateStageColor(dealStatuses, setDealStatuses, index, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={status.label}
                onChange={(e) => updateStageLabel(dealStatuses, setDealStatuses, index, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              />
              <span className="text-xs text-gray-400 w-20">{status.key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Types */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-[#fe5557]" />
          Service / Project Types
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Types of services/projects offered.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {serviceTypes.map((type, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {type}
              <button
                onClick={() => removeServiceType(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newServiceType}
            onChange={(e) => setNewServiceType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceType())}
            placeholder="Add service type..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
          />
          <button
            onClick={addServiceType}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <List className="w-5 h-5 text-[#fe5557]" />
          Lead Sources (Manual)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Options for how leads found your business.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {leadSources.map((source, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {source}
              <button
                onClick={() => removeLeadSource(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLeadSource}
            onChange={(e) => setNewLeadSource(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLeadSource())}
            placeholder="Add lead source..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
          />
          <button
            onClick={addLeadSource}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-[#fe5557]" />
          Defaults & Display
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Default Lead Priority</label>
            <select
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value as typeof defaultPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Deal Label</label>
            <input
              type="text"
              value={dealLabel}
              onChange={(e) => setDealLabel(e.target.value)}
              placeholder="Project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="$"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
