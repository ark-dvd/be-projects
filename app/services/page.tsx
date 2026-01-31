import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getServices, getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import CTASection from '@/components/CTASection'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Explore our full range of construction and renovation services. From kitchens to bathrooms, decks to whole-home remodels.',
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ])

  // Filter active services and sort by order
  const activeServices = services
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const companyName = settings.contractorName || 'Contractor'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Professional craftsmanship for every aspect of your home. From
            concept to completion, we bring your vision to life.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeServices.map((service) => {
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
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                          <span className="text-4xl font-bold text-amber-600">
                            {service.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {service.name}
                      </h2>
                      {service.tagline && (
                        <p className="text-amber-600 font-medium text-sm mb-3">
                          {service.tagline}
                        </p>
                      )}
                      {truncatedDescription && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {truncatedDescription}
                        </p>
                      )}
                      {service.priceRange && (
                        <p className="text-sm text-gray-500 mb-4">
                          Typical range: {service.priceRange}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
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
              <p className="text-gray-500 text-lg">
                Services coming soon — check back for our full range of offerings!
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
