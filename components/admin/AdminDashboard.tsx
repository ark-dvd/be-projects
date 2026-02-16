'use client'

import { useEffect, useState } from 'react'
import {
  FolderKanban,
  Wrench,
  Star,
  Plus,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { adminFetch } from '@/lib/admin-api'

interface DashboardStats {
  projects: number
  services: number
  testimonials: number
  recentProjects: Array<{ _id: string; title: string; status: string; _createdAt: string }>
  recentTestimonials: Array<{ _id: string; clientName: string; projectType: string; _createdAt: string }>
}

interface AdminDashboardProps {
  onNavigate: (tab: string) => void
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 transition-all hover:shadow-md" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [projects, services, testimonials] = await Promise.all([
        adminFetch<Array<{ _id: string; title: string; status: string; _createdAt: string }>>('projects'),
        adminFetch<Array<{ _id: string }>>('services'),
        adminFetch<Array<{ _id: string; clientName: string; projectType: string; _createdAt: string }>>('testimonials'),
      ])

      setStats({
        projects: projects.length,
        services: services.length,
        testimonials: testimonials.length,
        recentProjects: projects.slice(0, 3),
        recentTestimonials: testimonials.slice(0, 3),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
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
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Projects" value={stats.projects} icon={FolderKanban} color="#f59e0b" />
        <StatCard label="Active Services" value={stats.services} icon={Wrench} color="#3b82f6" />
        <StatCard label="Testimonials" value={stats.testimonials} icon={Star} color="#8b5cf6" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-amber-500" />
            Recent Projects
          </h3>
          {stats.recentProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProjects.map(project => (
                <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{project.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(project._createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Testimonials */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Recent Testimonials
          </h3>
          {stats.recentTestimonials.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No testimonials yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTestimonials.map(testimonial => (
                <div key={testimonial._id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{testimonial.clientName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{testimonial.projectType || 'General'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate('projects')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add New Project
        </button>
        <button
          onClick={() => onNavigate('testimonials')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add New Testimonial
        </button>
      </div>
    </div>
  )
}
