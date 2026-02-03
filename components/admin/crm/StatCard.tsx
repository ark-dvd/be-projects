'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  onClick?: () => void
  className?: string
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
  className = '',
}: StatCardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={`
        bg-white rounded-xl p-5 shadow-sm border border-gray-100
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-1 font-medium ${
                trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive !== false ? '↑' : '↓'} {trend.value} {trend.label}
            </p>
          )}
        </div>
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  )
}
