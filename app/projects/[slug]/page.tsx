import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Check,
  Phone,
  Quote,
  ArrowRight,
} from 'lucide-react'
import { getProjectBySlug, getProjects, getServices, getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import ProjectCard from '@/components/ProjectCard'
import ProjectGallery from './ProjectGallery'
import { StructuredData } from '@/components/StructuredData'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [project, settings] = await Promise.all([
    getProjectBySlug(params.slug),
    getSiteSettings(),
  ])

  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  const title = project.seoTitle || project.title
  const description = project.seoDescription || project.shortDescription || `View our ${project.title} project.`

  const rawUrl = process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${settings.contractorName || 'BE-Project Solutions'}`,
      description,
      type: 'article',
    },
    alternates: {
      canonical: `${baseUrl}/projects/${params.slug}`,
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const [project, allProjects, services, settings] = await Promise.all([
    getProjectBySlug(params.slug),
    getProjects(),
    getServices(),
    getSiteSettings(),
  ])

  if (!project) {
    notFound()
  }

  // Get service info if referenced
  const serviceId = project.service?._ref
  const service = services.find((s) => s._id === serviceId)

  // Get related projects (same service or random)
  const safeAllProjects = (allProjects || []).filter((p) => p.slug?.current)
  const relatedProjects = safeAllProjects
    .filter((p) => p._id !== project._id)
    .filter((p) => (serviceId ? p.service?._ref === serviceId : true))
    .slice(0, 3)

  // If not enough related by service, fill with others
  if (relatedProjects.length < 3) {
    const otherProjects = safeAllProjects
      .filter((p) => p._id !== project._id && !relatedProjects.find((r) => r._id === p._id))
      .slice(0, 3 - relatedProjects.length)
    relatedProjects.push(...otherProjects)
  }

  // Transform images for gallery
  const galleryImages = project.gallery?.map((img) => ({
    url: sanityImageUrl(img) || '',
    alt: img.alt || '',
    caption: img.caption || '',
  })).filter((img) => img.url) || []

  const heroImageUrl = sanityImageUrl(project.heroImage)
  const beforeImageUrl = sanityImageUrl(project.beforeImage)

  // Format location
  const location = [
    project.location?.neighborhood,
    project.location?.city,
    project.location?.state,
  ].filter(Boolean).join(', ')

  // Format completion date
  const completionDate = project.completionDate
    ? new Date(project.completionDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null

  const companyName = settings.contractorName || 'Contractor'

  // Status badge color
  const statusColors: Record<string, string> = {
    completed: 'bg-green-500',
    'in-progress': 'bg-amber-500',
    upcoming: 'bg-blue-500',
  }

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description || project.shortDescription || `${project.title} project by ${companyName}`,
    image: heroImageUrl || undefined,
    dateCreated: project.completionDate || undefined,
    creator: {
      '@type': 'Organization',
      name: companyName,
    },
  }

  return (
    <>
      <StructuredData data={structuredData} />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px]">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 text-white text-sm font-medium rounded-full ${
                  statusColors[project.status] || 'bg-gray-500'
                }`}
              >
                {project.status === 'in-progress' ? 'In Progress' : (project.status || 'unknown').charAt(0).toUpperCase() + (project.status || 'unknown').slice(1)}
              </span>
              {project.projectType && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {project.projectType}
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white drop-shadow-lg">
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Before & After */}
              {beforeImageUrl && heroImageUrl && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Before & After
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                      <Image
                        src={beforeImageUrl}
                        alt="Before"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900/80 text-white text-sm font-medium rounded-full">
                        Before
                      </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                      <Image
                        src={heroImageUrl}
                        alt="After"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {project.description && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    About This Project
                  </h2>
                  <div className="prose prose-lg text-gray-600 max-w-none">
                    {project.description.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Project Gallery
                  </h2>
                  <ProjectGallery images={galleryImages} />
                </div>
              )}

              {/* Client Testimonial */}
              {project.clientTestimonial && (
                <div className="bg-amber-50 rounded-2xl p-8">
                  <Quote className="h-10 w-10 text-amber-400 mb-4" />
                  <blockquote className="text-xl text-gray-800 italic mb-4">
                    &ldquo;{project.clientTestimonial}&rdquo;
                  </blockquote>
                  {project.clientName && (
                    <p className="font-semibold text-gray-900">
                      — {project.clientName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Project Details Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Details
                </h3>
                <dl className="space-y-4">
                  {project.projectType && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Project Type</dt>
                        <dd className="font-medium text-gray-900">
                          {project.projectType}
                        </dd>
                      </div>
                    </div>
                  )}
                  {service && service.slug?.current && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Service</dt>
                        <dd>
                          <Link
                            href={`/services/${service.slug.current}`}
                            className="font-medium text-amber-600 hover:text-amber-700"
                          >
                            {service.name || 'Service'}
                          </Link>
                        </dd>
                      </div>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Location</dt>
                        <dd className="font-medium text-gray-900">{location}</dd>
                      </div>
                    </div>
                  )}
                  {completionDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Completed</dt>
                        <dd className="font-medium text-gray-900">
                          {completionDate}
                        </dd>
                      </div>
                    </div>
                  )}
                  {project.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Duration</dt>
                        <dd className="font-medium text-gray-900">
                          {project.duration}
                        </dd>
                      </div>
                    </div>
                  )}
                  {project.budgetRange && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Budget Range</dt>
                        <dd className="font-medium text-gray-900">
                          {project.budgetRange}
                        </dd>
                      </div>
                    </div>
                  )}
                  {project.permitNumber && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Permit #</dt>
                        <dd className="font-medium text-gray-900">
                          {project.permitNumber}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>

                {/* Scope of Work */}
                {project.scope && project.scope.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Scope of Work
                    </h4>
                    <ul className="space-y-2">
                      {project.scope.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">
                    Interested in a similar project?
                  </p>
                  <Link
                    href="/contact"
                    className="block w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors text-center"
                  >
                    Get a Free Quote
                  </Link>
                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone.replace(/\D/g, '')}`}
                      className="flex items-center justify-center gap-2 mt-3 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      {settings.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedProjects.map((p) => (
                <ProjectCard
                  key={p._id}
                  slug={p.slug.current}
                  title={p.title}
                  heroImage={sanityImageUrl(p.heroImage)}
                  projectType={p.projectType}
                  shortDescription={p.shortDescription}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
