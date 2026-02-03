'use client'

import { useState, useEffect } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Save,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import SlidePanel from './SlidePanel'
import StatusBadge from './StatusBadge'
import ActivityTimeline from './ActivityTimeline'
import { Client, updateClient, deleteClient, fetchDeals, Deal } from '@/lib/crm-api'

interface ClientDetailProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  onCreateDeal?: (clientId: string) => void
  onViewDeal?: (deal: Deal) => void
}

export default function ClientDetail({
  client,
  isOpen,
  onClose,
  onUpdate,
  onCreateDeal,
  onViewDeal,
}: ClientDetailProps) {
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [deals, setDeals] = useState<Deal[]>([])
  const [loadingDeals, setLoadingDeals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({ ...client })
      setError(null)
      loadDeals()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client])

  const loadDeals = async () => {
    if (!client?._id) return
    try {
      setLoadingDeals(true)
      const response = await fetchDeals({ clientId: client._id })
      setDeals(response.deals)
    } catch (e) {
      console.error('Failed to load deals:', e)
    } finally {
      setLoadingDeals(false)
    }
  }

  const handleSave = async () => {
    if (!client?._id) return

    try {
      setSaving(true)
      setError(null)
      await updateClient({ ...formData, _id: client._id } as Client & { _id: string })
      onUpdate()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!client?._id) return

    try {
      setDeleting(true)
      setError(null)
      await deleteClient(client._id)
      onUpdate()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete client')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!client) return null

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={client.fullName}
      subtitle={`Client since ${new Date(client.clientSince).toLocaleDateString()}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || deals.length > 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
            title={deals.length > 0 ? 'Cannot delete client with existing projects' : ''}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Client?</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will permanently delete this client and all related activities.
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

      {/* Status */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Status
        </label>
        <select
          value={formData.status || 'active'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Contact Info */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          Contact Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent resize-none"
                placeholder="Street, City, State, ZIP"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Preferred Contact</label>
            <select
              value={formData.preferredContact || ''}
              onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as Client['preferredContact'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
            >
              <option value="">Not specified</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            Projects ({deals.length})
          </h3>
          {onCreateDeal && (
            <button
              onClick={() => onCreateDeal(client._id)}
              className="inline-flex items-center gap-1 text-xs text-[#fe5557] hover:text-[#e54446] font-medium"
            >
              <Plus className="w-3 h-3" />
              New Project
            </button>
          )}
        </div>

        {loadingDeals ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No projects yet</p>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => (
              <div
                key={deal._id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onViewDeal?.(deal)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {deal.dealType || 'General'} • {deal.value ? `$${deal.value.toLocaleString()}` : 'No value set'}
                    </p>
                  </div>
                  <StatusBadge status={deal.status} size="sm" />
                </div>
              </div>
            ))}
            {deals.length > 0 && (
              <p className="text-xs text-gray-500 text-right mt-2">
                Total: ${totalValue.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Internal Notes */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Internal Notes</h3>
        <textarea
          value={formData.internalNotes || ''}
          onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent resize-none"
          placeholder="Private notes about this client..."
        />
      </div>

      {/* Source Lead */}
      {client.sourceLead && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Converted from lead</p>
          <p className="text-sm font-medium text-gray-900">{client.sourceLead.fullName}</p>
        </div>
      )}

      {/* Activity Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity</h3>
        <ActivityTimeline clientId={client._id} limit={5} compact />
      </div>
    </SlidePanel>
  )
}
