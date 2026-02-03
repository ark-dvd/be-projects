import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, DollarSign, Phone, ArrowRight } from 'lucide-react'
import { getServiceBySlug, getServices, getProjects, getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import ProjectCard from '@/components/ProjectCard'
import ServiceGallery from './ServiceGallery'
import { StructuredData } from '@/components/StructuredData'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [service, settings] = await Promise.all([
    getServiceBySlug(params.slug),
    getSiteSettings(),
  ])

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  const description = service.tagline || service.description?.slice(0, 160) || `Learn about our ${service.name} services.`

  return {
    title: service.name,
    description,
    openGraph: {
      title: `${service.name} | ${settings.contractorName || 'Contractor'}`,
      description,
      type: 'website',
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const [service, allProjects, settings] = await Promise.all([
    getServiceBySlug(params.slug),
    getProjects(),
    getSiteSettings(),
  ])

  if (!service) {
    notFound()
  }

  // Get projects that reference this service
  const relatedProjects = allProjects
    .filter((p) => p.service?._ref === service._id)
    .slice(0, 6)

  // Transform images for gallery
  const galleryImages = service.gallery?.map((img) => ({
    url: sanityImageUrl(img) || '',
    alt: img.alt || '',
    caption: img.caption || '',
  })).filter((img) => img.url) || []

  const mainImageUrl = sanityImageUrl(service.image)
  const companyName = settings.contractorName || 'Contractor'

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description || service.tagline || `${service.name} services`,
    provider: {
      '@type': 'HomeImprovement',
      name: companyName,
    },
    areaServed: settings.serviceArea || undefined,
  }

  return (
    <>
      <StructuredData data={structuredData} />

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[500px]">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={service.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {service.name}
            </h1>
            {service.tagline && (
              <p className="text-lg lg:text-xl text-white/90 drop-shadow">
                {service.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              {service.description && (
                <div>
                  <div className="prose prose-lg text-gray-600 max-w-none">
                    {service.description.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Highlights */}
              {service.highlights && service.highlights.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    What We Offer
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {highlight.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {highlight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Our Work
                  </h2>
                  <ServiceGallery images={galleryImages} />
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Service Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Details
                </h3>

                {/* Details */}
                <dl className="space-y-4 mb-6">
                  {service.priceRange && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Typical Price Range</dt>
                        <dd className="font-medium text-gray-900">
                          {service.priceRange}
                        </dd>
                      </div>
                    </div>
                  )}
                  {service.typicalDuration && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm text-gray-500">Typical Duration</dt>
                        <dd className="font-medium text-gray-900">
                          {service.typicalDuration}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>

                {/* CTA */}
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">
                    Ready for your {service.name.toLowerCase()} project?
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
              Projects in {service.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  slug={project.slug.current}
                  title={project.title}
                  heroImage={sanityImageUrl(project.heroImage)}
                  projectType={project.projectType}
                  shortDescription={project.shortDescription}
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

      {/* CTA Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Your {service.name} Project?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Contact {companyName} today for a free consultation and estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Contact Us
            </Link>
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\D/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="h-5 w-5" />
                {settings.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
