'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  User,
  Clock,
  Plus,
  X,
} from 'lucide-react'
import SlidePanel from './SlidePanel'
import { createDeal, fetchClients, Client } from '@/lib/crm-api'

interface NewDealFormProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  preselectedClientId?: string
}

const TYPE_OPTIONS = [
  { value: 'kitchen_remodel', label: 'Kitchen Remodel' },
  { value: 'bathroom_remodel', label: 'Bathroom Remodel' },
  { value: 'home_addition', label: 'Home Addition' },
  { value: 'deck_patio', label: 'Deck / Patio' },
  { value: 'full_renovation', label: 'Full Renovation' },
  { value: 'adu_guest_house', label: 'ADU / Guest House' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'exterior_siding', label: 'Exterior / Siding' },
  { value: 'garage', label: 'Garage' },
  { value: 'basement_finish', label: 'Basement Finish' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
]

const initialFormData = {
  title: '',
  clientId: '',
  dealType: '',
  value: '',
  projectAddress: '',
  permitNumber: '',
  estimatedDuration: '',
  startDate: '',
  expectedEndDate: '',
  description: '',
  internalNotes: '',
  scope: [] as string[],
}

export default function NewDealForm({
  isOpen,
  onClose,
  onCreated,
  preselectedClientId,
}: NewDealFormProps) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    clientId: preselectedClientId || '',
  })
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newScopeItem, setNewScopeItem] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadClients()
      if (preselectedClientId) {
        setFormData((prev) => ({ ...prev, clientId: preselectedClientId }))
      }
    }
  }, [isOpen, preselectedClientId])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const response = await fetchClients({ status: 'active', limit: 100 })
      setClients(response.clients)
    } catch (e) {
      console.error('Failed to load clients:', e)
    } finally {
      setLoadingClients(false)
    }
  }

  const resetForm = () => {
    setFormData({ ...initialFormData, clientId: preselectedClientId || '' })
    setError(null)
    setValidationErrors({})
    setNewScopeItem('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validate = () => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Project title is required'
    }

    if (!formData.clientId) {
      errors.clientId = 'Please select a client'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const addScopeItem = () => {
    if (!newScopeItem.trim()) return
    setFormData({
      ...formData,
      scope: [...formData.scope, newScopeItem.trim()],
    })
    setNewScopeItem('')
  }

  const removeScopeItem = (index: number) => {
    setFormData({
      ...formData,
      scope: formData.scope.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setSaving(true)
      setError(null)

      await createDeal({
        title: formData.title,
        clientId: formData.clientId,
        dealType: formData.dealType || undefined,
        value: formData.value ? Number(formData.value) : undefined,
        status: 'planning',
        projectAddress: formData.projectAddress || undefined,
        permitNumber: formData.permitNumber || undefined,
        estimatedDuration: formData.estimatedDuration || undefined,
        startDate: formData.startDate || undefined,
        expectedEndDate: formData.expectedEndDate || undefined,
        description: formData.description || undefined,
        internalNotes: formData.internalNotes || undefined,
        scope: formData.scope.length > 0 ? formData.scope : undefined,
      })

      onCreated()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="New Project"
      subtitle="Create a new project for a client"
      width="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client Selection */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              disabled={loadingClients || !!preselectedClientId}
              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent ${
                validationErrors.clientId ? 'border-red-300' : 'border-gray-300'
              } ${preselectedClientId ? 'bg-gray-50' : ''}`}
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </div>
          {validationErrors.clientId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.clientId}</p>
          )}
        </div>

        {/* Project Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Project Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Kitchen Renovation - Smith Residence"
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Project Type</label>
                <select
                  value={formData.dealType}
                  onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Contract Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Project Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.projectAddress}
                    onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                    placeholder="Job site address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estimated Duration</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                    placeholder="e.g., 6-8 weeks"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Schedule
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expected End</label>
              <input
                type="date"
                value={formData.expectedEndDate}
                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Scope of Work</label>
          <div className="space-y-2">
            {formData.scope.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="flex-1 text-sm text-gray-700">{item}</span>
                <button
                  type="button"
                  onClick={() => removeScopeItem(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newScopeItem}
                onChange={(e) => setNewScopeItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addScopeItem())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                placeholder="Add scope item..."
              />
              <button
                type="button"
                onClick={addScopeItem}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description / Notes</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent resize-none"
            placeholder="Project details, special requirements..."
          />
        </div>
      </form>
    </SlidePanel>
  )
}
