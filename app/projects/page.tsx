import { Metadata } from 'next'
import { getProjects, getServices, getSiteSettings } from '@/lib/data-fetchers'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60
import { sanityImageUrl } from '@/lib/sanity-helpers'
import ProjectCard from '@/components/ProjectCard'
import CTASection from '@/components/CTASection'
import ProjectsFilter from './ProjectsFilter'

export const metadata: Metadata = {
  title: 'Our Projects',
  description: 'Browse our portfolio of completed landscaping and outdoor living projects.',
}

export default async function ProjectsPage() {
  const [projects, services, settings] = await Promise.all([
    getProjects(),
    getServices(),
    getSiteSettings(),
  ])

  // Get unique project types for filtering
  const projectTypes = Array.from(new Set((projects || []).map((p) => p.projectType).filter((t): t is string => Boolean(t))))

  // Transform projects for client component
  const transformedProjects = (projects || [])
    .filter((project) => project.slug?.current)
    .map((project) => ({
      _id: project._id,
      slug: project.slug.current,
      title: project.title || 'Untitled Project',
      heroImage: sanityImageUrl(project.heroImage),
      projectType: project.projectType,
      shortDescription: project.shortDescription,
      status: project.status || 'completed',
      serviceRef: project.service?._ref,
    }))

  // Transform services for filter
  const serviceOptions = services.map((s) => ({
    _id: s._id,
    name: s.name,
  }))

  const companyName = settings.contractorName || 'Contractor'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            {settings.projectsPageHeadline || 'Our Projects'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {settings.projectsPageDescription || 'Browse our portfolio of completed and in-progress landscaping work. Each project represents our commitment to quality craftsmanship.'}
          </p>
        </div>
      </section>

      {/* Projects Grid with Filters */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {transformedProjects.length > 0 ? (
            <ProjectsFilter
              projects={transformedProjects}
              projectTypes={projectTypes}
              services={serviceOptions}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-gray-500 text-lg">
                No projects yet — check back soon for our portfolio of completed work!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection companyName={companyName} phone={settings.phone} />
    </>
  )
}
