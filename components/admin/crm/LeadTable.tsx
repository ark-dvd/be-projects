'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import SourceTag from './SourceTag'
import LeadDetail from './LeadDetail'
import NewLeadForm from './NewLeadForm'
import { fetchLeads, Lead, LeadsResponse } from '@/lib/crm-api'

interface LeadTableProps {
  onLeadConverted?: () => void
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(value?: number): string {
  if (!value) return '-'
  return '$' + value.toLocaleString()
}

export default function LeadTable({ onLeadConverted }: LeadTableProps) {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchLeads({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: pageSize,
        offset: page * pageSize,
      })
      setData(response)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page])

  // Filter leads by search query (client-side)
  const filteredLeads = useMemo(() => {
    if (!data?.leads) return []
    if (!searchQuery.trim()) return data.leads

    const q = searchQuery.toLowerCase()
    return data.leads.filter(
      (lead) =>
        lead.fullName?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.includes(q) ||
        lead.serviceType?.toLowerCase().includes(q) ||
        lead.description?.toLowerCase().includes(q)
    )
  }, [data?.leads, searchQuery])

  const handleRefresh = () => {
    setPage(0)
    loadLeads()
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(0)
  }

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const handleLeadUpdate = () => {
    loadLeads()
    if (onLeadConverted) onLeadConverted()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500">
            {data?.total || 0} total leads
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fe5557] focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((filter) => {
            const count = filter.value === 'all'
              ? data?.statusCounts?.total
              : data?.statusCounts?.[filter.value]

            return (
              <button
                key={filter.value}
                onClick={() => handleStatusFilterChange(filter.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-[#fe5557] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {count !== undefined && (
                  <span className="ml-1 opacity-75">({count})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Try again
            </button>
          </div>
        ) : loading && !data ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="flex-1" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No leads match your search' : 'No leads found'}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Service Type</div>
              <div className="col-span-1">Value</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <div
                  key={lead._id}
                  onClick={() => handleLeadClick(lead)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Mobile View */}
                  <div className="lg:hidden space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{lead.fullName}</p>
                        <p className="text-sm text-gray-500">{lead.email || lead.phone || '-'}</p>
                      </div>
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <SourceTag origin={lead.origin} source={lead.source} size="sm" />
                      {lead.estimatedValue && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {lead.estimatedValue.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.receivedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <p className="font-medium text-gray-900 truncate">{lead.fullName}</p>
                      <p className="text-sm text-gray-500 truncate">{lead.email || lead.phone || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <SourceTag origin={lead.origin} source={lead.source} size="sm" />
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 truncate">
                      {lead.serviceType || '-'}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {formatCurrency(lead.estimatedValue)}
                    </div>
                    <div className="col-span-1">
                      <StatusBadge status={lead.priority} size="sm" showDot={false} />
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">
                      {formatDate(lead.receivedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data && data.total > pageSize && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, data.total)} of {data.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.pagination.hasMore}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lead Detail Panel */}
      <LeadDetail
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
        onConvert={onLeadConverted}
      />

      {/* New Lead Form */}
      <NewLeadForm
        isOpen={showNewForm}
        onClose={() => setShowNewForm(false)}
        onCreated={handleLeadUpdate}
      />
    </div>
  )
}
