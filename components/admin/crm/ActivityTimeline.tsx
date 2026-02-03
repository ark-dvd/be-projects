'use client'

import { useEffect, useState } from 'react'
import {
  Zap,
  Pencil,
  Phone,
  Mail,
  MailOpen,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
  Briefcase,
  Trophy,
  Bell,
  Bot,
  MessageSquare,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { fetchActivities, Activity } from '@/lib/crm-api'

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  lead_created_auto: Zap,
  lead_created_manual: Pencil,
  status_changed: ArrowRight,
  call_logged: Phone,
  email_sent: Mail,
  email_received: MailOpen,
  note_added: MessageSquare,
  site_visit_scheduled: Calendar,
  site_visit_completed: CheckCircle,
  quote_sent: FileText,
  quote_accepted: CheckCircle,
  quote_rejected: XCircle,
  converted_to_client: UserPlus,
  deal_created: Briefcase,
  deal_completed: Trophy,
  auto_reply_sent: Bot,
  notification_sent: Bell,
  custom: MessageSquare,
}

const ACTIVITY_COLORS: Record<string, string> = {
  lead_created_auto: '#fe5557',
  lead_created_manual: '#6b7280',
  status_changed: '#8b5cf6',
  call_logged: '#3b82f6',
  email_sent: '#3b82f6',
  email_received: '#10b981',
  note_added: '#6b7280',
  site_visit_scheduled: '#f59e0b',
  site_visit_completed: '#10b981',
  quote_sent: '#f59e0b',
  quote_accepted: '#10b981',
  quote_rejected: '#ef4444',
  converted_to_client: '#10b981',
  deal_created: '#8b5cf6',
  deal_completed: '#10b981',
  auto_reply_sent: '#6b7280',
  notification_sent: '#6b7280',
  custom: '#6b7280',
}

const ACTIVITY_LABELS: Record<string, string> = {
  lead_created_auto: 'Lead auto-created',
  lead_created_manual: 'Lead created',
  status_changed: 'Status changed',
  call_logged: 'Call logged',
  email_sent: 'Email sent',
  email_received: 'Email received',
  note_added: 'Note added',
  site_visit_scheduled: 'Site visit scheduled',
  site_visit_completed: 'Site visit completed',
  quote_sent: 'Quote sent',
  quote_accepted: 'Quote accepted',
  quote_rejected: 'Quote rejected',
  converted_to_client: 'Converted to client',
  deal_created: 'Project created',
  deal_completed: 'Project completed',
  auto_reply_sent: 'Auto-reply sent',
  notification_sent: 'Notification sent',
  custom: 'Note',
}

interface ActivityTimelineProps {
  leadId?: string
  clientId?: string
  dealId?: string
  limit?: number
  showLoadMore?: boolean
  compact?: boolean
  className?: string
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export default function ActivityTimeline({
  leadId,
  clientId,
  dealId,
  limit = 10,
  showLoadMore = true,
  compact = false,
  className = '',
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const loadActivities = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset
      const response = await fetchActivities({
        leadId,
        clientId,
        dealId,
        limit,
        offset: currentOffset,
      })

      if (reset) {
        setActivities(response.activities)
        setOffset(limit)
      } else {
        setActivities((prev) => [...prev, ...response.activities])
        setOffset((prev) => prev + limit)
      }

      setHasMore(response.pagination.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, clientId, dealId])

  if (loading && activities.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-red-500 text-sm mb-2">{error}</p>
        <button
          onClick={() => loadActivities(true)}
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare
            const color = ACTIVITY_COLORS[activity.type] || '#6b7280'
            const label = ACTIVITY_LABELS[activity.type] || activity.type

            return (
              <div key={activity._id} className="relative flex gap-3">
                {/* Icon */}
                <div
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Content */}
                <div className={`flex-1 ${compact ? 'pb-2' : 'pb-4'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>
                        {label}
                      </p>
                      {activity.description && (
                        <p className={`text-gray-600 mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                          {activity.description}
                        </p>
                      )}
                      {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  {!compact && activity.performedBy && activity.performedBy !== 'system' && (
                    <p className="text-xs text-gray-400 mt-1">by {activity.performedBy}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Load More */}
      {showLoadMore && hasMore && (
        <button
          onClick={() => loadActivities()}
          disabled={loading}
          className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}

// Export for use in other components
export { ACTIVITY_ICONS, ACTIVITY_COLORS, ACTIVITY_LABELS }
