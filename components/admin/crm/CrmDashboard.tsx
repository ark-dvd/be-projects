'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  Pencil,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import StatCard from './StatCard'
import StatusBadge from './StatusBadge'
import SourceTag from './SourceTag'
import { fetchLeads, fetchClients, fetchDeals, fetchActivities, Lead, Activity } from '@/lib/crm-api'

interface CrmDashboardProps {
  onNavigate: (view: string) => void
}

interface DashboardStats {
  newLeads: number
  totalLeads: number
  activeClients: number
  openDeals: number
  pipelineValue: number
  recentLeads: Lead[]
  recentActivities: Activity[]
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CrmDashboard({ onNavigate }: CrmDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const [leadsData, clientsData, dealsData, activitiesData] = await Promise.all([
        fetchLeads({ limit: 5 }),
        fetchClients({ status: 'active', limit: 1 }),
        fetchDeals({ limit: 1 }),
        fetchActivities({ limit: 8 }),
      ])

      setStats({
        newLeads: leadsData.statusCounts?.new || 0,
        totalLeads: leadsData.total,
        activeClients: clientsData.statusCounts?.active || 0,
        openDeals: (dealsData.statusCounts?.planning || 0) +
                   (dealsData.statusCounts?.permitting || 0) +
                   (dealsData.statusCounts?.in_progress || 0) +
                   (dealsData.statusCounts?.inspection || 0),
        pipelineValue: dealsData.pipelineValue,
        recentLeads: leadsData.leads,
        recentActivities: activitiesData.activities,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded" />
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
          <p className="font-medium">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fe5557] text-white rounded-lg hover:bg-[#e54446] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New Leads"
          value={stats.newLeads}
          icon={Users}
          color="#fe5557"
          onClick={() => onNavigate('crm-leads')}
        />
        <StatCard
          label="Active Clients"
          value={stats.activeClients}
          icon={UserCheck}
          color="#10b981"
          onClick={() => onNavigate('crm-clients')}
        />
        <StatCard
          label="Open Projects"
          value={stats.openDeals}
          icon={Briefcase}
          color="#8b5cf6"
          onClick={() => onNavigate('crm-deals')}
        />
        <StatCard
          label="Pipeline Value"
          value={`$${stats.pipelineValue.toLocaleString()}`}
          icon={DollarSign}
          color="#f59e0b"
          onClick={() => onNavigate('crm-pipeline')}
        />
      </div>

      {/* Pipeline Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#fe5557]" />
            Lead Pipeline
          </h3>
          <button
            onClick={() => onNavigate('crm-pipeline')}
            className="text-sm text-[#fe5557] hover:text-[#e54446] font-medium flex items-center gap-1"
          >
            View Pipeline
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-4 text-gray-500">
          <p>
            {stats.newLeads} new leads, {stats.totalLeads - stats.newLeads} in progress
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#fe5557]" />
              Recent Leads
            </h3>
            <button
              onClick={() => onNavigate('crm-leads')}
              className="text-sm text-[#fe5557] hover:text-[#e54446] font-medium"
            >
              View All
            </button>
          </div>

          {stats.recentLeads.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onNavigate('crm-leads')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lead.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SourceTag origin={lead.origin} source={lead.source} size="sm" />
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(lead.receivedAt)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-[#fe5557]" />
            Recent Activity
          </h3>

          {stats.recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => {
                const isAuto = activity.type.includes('auto')
                return (
                  <div key={activity._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isAuto ? '#fe555715' : '#6b728015',
                      }}
                    >
                      {isAuto ? (
                        <Zap className="w-4 h-4 text-[#fe5557]" />
                      ) : (
                        <Pencil className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description || activity.type.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {activity.lead?.fullName || activity.client?.fullName || activity.deal?.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
