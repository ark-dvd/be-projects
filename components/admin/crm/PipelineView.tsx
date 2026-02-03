'use client'

import { useEffect, useState } from 'react'
import {
  RefreshCw,
  DollarSign,
  Calendar,
} from 'lucide-react'
import SourceTag from './SourceTag'
import LeadDetail from './LeadDetail'
import { fetchLeads, fetchCrmSettings, Lead, CrmSettings, PipelineStage } from '@/lib/crm-api'

interface PipelineViewProps {
  onLeadConverted?: () => void
}

const DEFAULT_STAGES: PipelineStage[] = [
  { key: 'new', label: 'New Lead', color: '#fe5557' },
  { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'site_visit', label: 'Site Visit', color: '#6366f1' },
  { key: 'quoted', label: 'Quote Sent', color: '#f59e0b' },
  { key: 'negotiating', label: 'Negotiating', color: '#f97316' },
  { key: 'won', label: 'Won', color: '#10b981' },
  { key: 'lost', label: 'Lost', color: '#6b7280' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCurrency(value?: number): string {
  if (!value) return ''
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

export default function PipelineView({ onLeadConverted }: PipelineViewProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [leadsResponse, settings] = await Promise.all([
        fetchLeads({ limit: 100 }),
        fetchCrmSettings().catch(() => null),
      ])

      setLeads(leadsResponse.leads)

      if (settings?.pipelineStages && settings.pipelineStages.length > 0) {
        setStages(settings.pipelineStages)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pipeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLeadUpdate = () => {
    loadData()
    if (onLeadConverted) onLeadConverted()
  }

  // Group leads by status
  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage.key] = leads.filter((lead) => lead.status === stage.key)
    return acc
  }, {} as Record<string, Lead[]>)

  // Calculate totals per stage
  const stageTotals = stages.reduce((acc, stage) => {
    const stageLeads = leadsByStage[stage.key] || []
    acc[stage.key] = stageLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Failed to load pipeline</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pipeline</h2>
          <p className="text-sm text-gray-500">{leads.length} total leads</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {stages.map((stage) => {
          const stageLeads = leadsByStage[stage.key] || []
          const stageTotal = stageTotals[stage.key] || 0

          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-xl overflow-hidden"
            >
              {/* Column Header */}
              <div
                className="px-4 py-3 border-b-2"
                style={{ borderBottomColor: stage.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium text-gray-900">{stage.label}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stageLeads.length}</span>
                </div>
                {stageTotal > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(stageTotal)} total
                  </p>
                )}
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No leads</p>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer transition-all"
                    >
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {lead.fullName}
                      </p>
                      {lead.serviceType && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {lead.serviceType}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {lead.estimatedValue ? (
                          <span className="text-xs text-gray-600 flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {lead.estimatedValue.toLocaleString()}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lead.receivedAt)}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <SourceTag origin={lead.origin} source={lead.source} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lead Detail Panel */}
      <LeadDetail
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
        onConvert={onLeadConverted}
      />
    </div>
  )
}
