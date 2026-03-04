import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getServices, getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import { buildOgBase, getBaseUrl } from '@/lib/seo'
import { StructuredData } from '@/components/StructuredData'
import CTASection from '@/components/CTASection'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, ogBase] = await Promise.all([getSiteSettings(), buildOgBase('/services')])

  return {
    title: settings.servicesPageHeadline || 'Our Services',
    description: settings.servicesPageDescription || 'Explore our full range of landscaping and outdoor living services.',
    openGraph: {
      ...ogBase,
      title: `${settings.servicesPageHeadline || 'Our Services'} | ${settings.contractorName || 'BE Project Solutions'}`,
      description: settings.servicesPageDescription || 'Explore our full range of landscaping and outdoor living services.',
    },
    alternates: {
      canonical: ogBase.url,
    },
  }
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ])

  // Filter active services and sort by order
  const activeServices = (services || [])
    .filter((s) => s.isActive !== false && s.slug?.current)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const companyName = settings.contractorName || 'Contractor'
  const baseUrl = getBaseUrl()

  // ItemList structured data for SEO
  const itemListData = activeServices.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: activeServices.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${baseUrl}/services/${s.slug.current}`,
      name: s.name,
    })),
  } : null

  return (
    <>
      {itemListData && <StructuredData data={itemListData} />}

      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            {settings.servicesPageHeadline || 'Our Services'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {settings.servicesPageDescription || 'Professional craftsmanship for every aspect of your home. From concept to completion, we bring your vision to life.'}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeServices.map((service, index) => {
                const imageUrl = sanityImageUrl(service.image)
                const truncatedDescription = service.description
                  ? service.description.slice(0, 150) +
                    (service.description.length > 150 ? '...' : '')
                  : ''

                return (
                  <Link
                    key={service._id}
                    href={`/services/${service.slug.current}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary">
                            {(service.name || 'S').charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-dark mb-2 group-hover:text-accent transition-colors font-heading">
                        {service.name}
                      </h2>
                      {service.tagline && (
                        <p className="text-accent font-medium text-sm mb-3">
                          {service.tagline}
                        </p>
                      )}
                      {truncatedDescription && (
                        <p className="text-secondary text-sm mb-4 line-clamp-3">
                          {truncatedDescription}
                        </p>
                      )}
                      {service.priceRange && (
                        <p className="text-sm text-secondary mb-4">
                          Typical range: {service.priceRange}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-accent font-medium text-sm group-hover:gap-2 transition-all">
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <p className="text-secondary text-lg">
                Services coming soon — check back for our full range of offerings!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        companyName={companyName}
        phone={settings.phone}
        headline={settings.ctaSectionHeadline}
        description={settings.ctaSectionDescription}
        buttonText={settings.ctaSectionButtonText}
      />
    </>
  )
}
