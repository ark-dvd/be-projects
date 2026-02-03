'use client'

import { useMemo } from 'react'

// Default status colors (can be overridden by CRM settings)
const DEFAULT_STATUS_COLORS: Record<string, string> = {
  // Lead statuses
  new: '#fe5557',
  contacted: '#8b5cf6',
  site_visit: '#6366f1',
  quoted: '#f59e0b',
  negotiating: '#f97316',
  won: '#10b981',
  lost: '#6b7280',
  // Deal statuses
  planning: '#f59e0b',
  permitting: '#6366f1',
  in_progress: '#10b981',
  inspection: '#14b8a6',
  completed: '#059669',
  warranty: '#6b7280',
  paused: '#ef4444',
  cancelled: '#374151',
  // Client statuses
  active: '#10b981',
  past: '#6b7280',
  // Priority
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  // Lead statuses
  new: 'New',
  contacted: 'Contacted',
  site_visit: 'Site Visit',
  quoted: 'Quote Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
  // Deal statuses
  planning: 'Planning',
  permitting: 'Permitting',
  in_progress: 'In Progress',
  inspection: 'Inspection',
  completed: 'Completed',
  warranty: 'Warranty',
  paused: 'Paused',
  cancelled: 'Cancelled',
  // Client statuses
  active: 'Active',
  past: 'Past',
  // Priority
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
  customColors?: Record<string, string>
  customLabels?: Record<string, string>
  className?: string
}

export default function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  customColors,
  customLabels,
  className = '',
}: StatusBadgeProps) {
  const color = useMemo(() => {
    return customColors?.[status] || DEFAULT_STATUS_COLORS[status] || '#6b7280'
  }, [status, customColors])

  const label = useMemo(() => {
    return customLabels?.[status] || DEFAULT_STATUS_LABELS[status] || status
  }, [status, customLabels])

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {showDot && (
        <span
          className={`rounded-full ${dotSizes[size]}`}
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  )
}

// Export for use in other components
export { DEFAULT_STATUS_COLORS, DEFAULT_STATUS_LABELS }
