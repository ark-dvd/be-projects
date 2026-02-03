'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Save,
  Trash2,
  User,
  Clock,
  Plus,
  X,
} from 'lucide-react'
import SlidePanel from './SlidePanel'
import StatusBadge from './StatusBadge'
import ActivityTimeline from './ActivityTimeline'
import { Deal, updateDeal, deleteDeal } from '@/lib/crm-api'

interface DealDetailProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  onViewClient?: (clientId: string) => void
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'permitting', label: 'Permitting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'inspection', label: 'Final Inspection' },
  { value: 'completed', label: 'Completed' },
  { value: 'warranty', label: 'Warranty Period' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

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

export default function DealDetail({
  deal,
  isOpen,
  onClose,
  onUpdate,
  onViewClient,
}: DealDetailProps) {
  const [formData, setFormData] = useState<Partial<Deal> & { clientId?: string }>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newScopeItem, setNewScopeItem] = useState('')

  useEffect(() => {
    if (deal) {
      setFormData({
        ...deal,
        clientId: deal.client?._id,
      })
      setError(null)
    }
  }, [deal])

  const handleSave = async () => {
    if (!deal?._id) return

    try {
      setSaving(true)
      setError(null)
      await updateDeal({
        _id: deal._id,
        title: formData.title,
        clientId: formData.clientId || deal.client._id,
        dealType: formData.dealType,
        value: formData.value,
        status: formData.status,
        projectAddress: formData.projectAddress,
        permitNumber: formData.permitNumber,
        estimatedDuration: formData.estimatedDuration,
        scope: formData.scope,
        contractSignedDate: formData.contractSignedDate,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        actualEndDate: formData.actualEndDate,
        description: formData.description,
        internalNotes: formData.internalNotes,
      })
      onUpdate()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deal?._id) return

    try {
      setDeleting(true)
      setError(null)
      await deleteDeal(deal._id)
      onUpdate()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete project')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const addScopeItem = () => {
    if (!newScopeItem.trim()) return
    setFormData({
      ...formData,
      scope: [...(formData.scope || []), newScopeItem.trim()],
    })
    setNewScopeItem('')
  }

  const removeScopeItem = (index: number) => {
    setFormData({
      ...formData,
      scope: (formData.scope || []).filter((_, i) => i !== index),
    })
  }

  if (!deal) return null

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={deal.title}
      subtitle={deal.client?.fullName}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] disabled:opacity-50 transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will permanently delete this project and all related activities.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Client Link */}
      {deal.client && (
        <div
          className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onViewClient?.(deal.client._id)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fe5557]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#fe5557]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{deal.client.fullName}</p>
              <p className="text-xs text-gray-500">{deal.client.email || deal.client.phone}</p>
            </div>
          </div>
          <StatusBadge status="active" size="sm" />
        </div>
      )}

      {/* Status and Value */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Status
          </label>
          <select
            value={formData.status || 'planning'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Deal['status'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Contract Value
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          Project Details
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project Type</label>
              <select
                value={formData.dealType || ''}
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
              <label className="block text-xs text-gray-500 mb-1">Estimated Duration</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.estimatedDuration || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                  placeholder="e.g., 6-8 weeks"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.projectAddress || ''}
                onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                placeholder="Job site address"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Permit Number</label>
            <input
              type="text"
              value={formData.permitNumber || ''}
              onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
              placeholder="Building permit reference"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          Key Dates
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contract Signed</label>
            <input
              type="date"
              value={formData.contractSignedDate || ''}
              onChange={(e) => setFormData({ ...formData, contractSignedDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Expected End</label>
            <input
              type="date"
              value={formData.expectedEndDate || ''}
              onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Actual End</label>
            <input
              type="date"
              value={formData.actualEndDate || ''}
              onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Scope of Work
        </h3>
        <div className="space-y-2">
          {(formData.scope || []).map((item, index) => (
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

      {/* Description */}
      <div className="mb-6">
        <label className="block text-xs text-gray-500 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent resize-none"
          placeholder="Project description and details..."
        />
      </div>

      {/* Internal Notes */}
      <div className="mb-6">
        <label className="block text-xs text-gray-500 mb-1">Internal Notes</label>
        <textarea
          value={formData.internalNotes || ''}
          onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent resize-none"
          placeholder="Private notes..."
        />
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity</h3>
        <ActivityTimeline dealId={deal._id} limit={5} compact />
      </div>
    </SlidePanel>
  )
}
