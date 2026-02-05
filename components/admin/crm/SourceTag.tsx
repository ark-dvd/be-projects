'use client'

import { Zap, Pencil } from 'lucide-react'

const SOURCE_LABELS: Record<string, string> = {
  // Auto sources
  auto_website_form: 'Website Form',
  auto_landing_page: 'Landing Page',
  website_form: 'Website Form',
  // Manual sources
  phone_call: 'Phone Call',
  referral: 'Referral',
  walk_in: 'Walk-in',
  yard_sign: 'Yard Sign',
  home_show: 'Home Show',
  returning_client: 'Returning Client',
  nextdoor: 'Nextdoor',
  social_media: 'Social Media',
  other: 'Other',
}

interface SourceTagProps {
  origin?: string // Tolerant: accepts any string or undefined for legacy/seeded leads
  source?: string
  size?: 'sm' | 'md'
  className?: string
}

export default function SourceTag({
  origin,
  source,
  size = 'md',
  className = '',
}: SourceTagProps) {
  const isAuto = origin?.startsWith('auto')

  // Determine display label
  const label = isAuto
    ? SOURCE_LABELS[origin || ''] || 'Auto'
    : SOURCE_LABELS[source || ''] || source || 'Manual'

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }

  if (isAuto) {
    return (
      <span
        className={`inline-flex items-center ${sizeClasses[size]} font-medium ${className}`}
        style={{ color: '#fe5557' }}
      >
        <Zap className={iconSizes[size]} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} text-gray-500 ${className}`}
    >
      <Pencil className={iconSizes[size]} />
      {label}
    </span>
  )
}

// Export for use in other components
export { SOURCE_LABELS }
