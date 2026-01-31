'use client'

import { useState, useMemo } from 'react'
import ProjectCard from '@/components/ProjectCard'

interface Project {
  _id: string
  slug: string
  title: string
  heroImage?: string
  projectType?: string
  shortDescription?: string
  status: 'completed' | 'in-progress' | 'upcoming'
  serviceRef?: string
}

interface Service {
  _id: string
  name: string
}

interface ProjectsFilterProps {
  projects: Project[]
  projectTypes: string[]
  services: Service[]
}

type StatusFilter = 'all' | 'completed' | 'in-progress' | 'upcoming'

export default function ProjectsFilter({
  projects,
  projectTypes,
  services,
}: ProjectsFilterProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false
      }
      // Type filter
      if (typeFilter !== 'all' && project.projectType !== typeFilter) {
        return false
      }
      // Service filter
      if (serviceFilter !== 'all' && project.serviceRef !== serviceFilter) {
        return false
      }
      return true
    })
  }, [projects, statusFilter, typeFilter, serviceFilter])

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Type and Service Filters */}
        <div className="flex flex-wrap gap-4">
          {projectTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="all">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {services.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Service:</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="all">All Services</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Project Count */}
      <p className="text-sm text-gray-500 mb-6">
        Showing {filteredProjects.length} project
        {filteredProjects.length !== 1 ? 's' : ''}
      </p>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              slug={project.slug}
              title={project.title}
              heroImage={project.heroImage}
              projectType={project.projectType}
              shortDescription={project.shortDescription}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-gray-500 text-lg mb-2">No projects match your filters</p>
          <button
            onClick={() => {
              setStatusFilter('all')
              setTypeFilter('all')
              setServiceFilter('all')
            }}
            className="text-amber-600 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
