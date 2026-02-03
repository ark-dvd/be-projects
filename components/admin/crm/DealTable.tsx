'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  User,
  Calendar,
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import DealDetail from './DealDetail'
import NewDealForm from './NewDealForm'
import { fetchDeals, Deal, DealsResponse } from '@/lib/crm-api'

interface DealTableProps {
  onViewClient?: (clientId: string) => void
  preselectedClientId?: string
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'planning', label: 'Planning' },
  { value: 'permitting', label: 'Permitting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
]

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(value?: number): string {
  if (!value) return '-'
  return '$' + value.toLocaleString()
}

export default function DealTable({ onViewClient, preselectedClientId }: DealTableProps) {
  const [data, setData] = useState<DealsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchDeals({
        status: statusFilter === 'all' ? undefined : statusFilter,
        clientId: preselectedClientId,
        limit: pageSize,
        offset: page * pageSize,
      })
      setData(response)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, preselectedClientId])

  // Filter deals by search query (client-side)
  const filteredDeals = useMemo(() => {
    if (!data?.deals) return []
    if (!searchQuery.trim()) return data.deals

    const q = searchQuery.toLowerCase()
    return data.deals.filter(
      (deal) =>
        deal.title?.toLowerCase().includes(q) ||
        deal.client?.fullName?.toLowerCase().includes(q) ||
        deal.dealType?.toLowerCase().includes(q) ||
        deal.projectAddress?.toLowerCase().includes(q)
    )
  }, [data?.deals, searchQuery])

  const handleRefresh = () => {
    setPage(0)
    loadDeals()
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(0)
  }

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
  }

  const handleDealUpdate = () => {
    loadDeals()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">
            {data?.total || 0} total projects
            {data?.pipelineValue ? ` • $${data.pipelineValue.toLocaleString()} in pipeline` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
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
            placeholder="Search projects..."
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
        ) : filteredDeals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No projects match your search' : 'No projects found'}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">Project</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Value</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Start</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredDeals.map((deal) => (
                <div
                  key={deal._id}
                  onClick={() => handleDealClick(deal)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Mobile View */}
                  <div className="lg:hidden space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">{deal.client?.fullName || '-'}</p>
                      </div>
                      <StatusBadge status={deal.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{deal.dealType || '-'}</span>
                      {deal.value && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {deal.value.toLocaleString()}
                        </span>
                      )}
                      {deal.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(deal.startDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <p className="font-medium text-gray-900 truncate">{deal.title}</p>
                      {deal.projectAddress && (
                        <p className="text-sm text-gray-500 truncate">{deal.projectAddress}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {deal.client?.fullName || '-'}
                      </p>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 truncate">
                      {deal.dealType || '-'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {formatCurrency(deal.value)}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={deal.status} size="sm" />
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">
                      {formatDate(deal.startDate)}
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

      {/* Deal Detail Panel */}
      <DealDetail
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleDealUpdate}
        onViewClient={onViewClient}
      />

      {/* New Deal Form */}
      <NewDealForm
        isOpen={showNewForm}
        onClose={() => setShowNewForm(false)}
        onCreated={handleDealUpdate}
        preselectedClientId={preselectedClientId}
      />
    </div>
  )
}
