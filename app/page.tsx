import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60
import {
  getSiteSettings,
  getProjects,
  getServices,
  getTestimonials,
} from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import HeroSection from '@/components/HeroSection'
import ProjectCard from '@/components/ProjectCard'
import ServiceCard from '@/components/ServiceCard'
import TestimonialCard from '@/components/TestimonialCard'
import CTASection from '@/components/CTASection'
import { StructuredData } from '@/components/StructuredData'

export default async function HomePage() {
  // Fetch all data in parallel
  const [settings, projects, services, testimonials] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getServices(),
    getTestimonials(),
  ])

  // Filter featured projects (take first 6 completed with valid slugs)
  const featuredProjects = (projects || [])
    .filter((p) => p.status === 'completed' && p.slug?.current)
    .slice(0, 6)

  // Filter active services with valid slugs
  const activeServices = (services || [])
    .filter((s) => s.isActive !== false && s.slug?.current && s.name)

  // Filter testimonials for preview: prefer featured, fall back to any active
  const validTestimonials = (testimonials || []).filter((t) => t.clientName && t.quote)
  const featuredOnly = validTestimonials.filter((t) => t.isFeatured)
  const featuredTestimonials = featuredOnly.length > 0 ? featuredOnly : validTestimonials

  // Parse stats from settings
  const stats = settings.aboutStats || []

  // Transform hero images - use direct URL from query if available, fallback to helper
  const heroImages = settings.heroImages?.map((img) => ({
    url: img.url || sanityImageUrl(img) || '',
    alt: img.alt || '',
  })).filter((img) => img.url) || []

  // Get hero video URL - use direct URL from GROQ query
  const heroVideoUrl = settings.heroVideoUrl || undefined

  // Debug log for video
  console.log('[Homepage] heroMediaType:', settings.heroMediaType)
  console.log('[Homepage] heroVideoUrl:', heroVideoUrl)

  // Transform photo URL
  const photoUrl = sanityImageUrl(settings.contractorPhoto)

  // Company name
  const companyName = settings.contractorName || 'Contractor'

  // Build LocalBusiness structured data
  const logoUrl = sanityImageUrl(settings.logo)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HomeImprovement',
    name: companyName,
    description: settings.aboutText?.slice(0, 300) || `Professional landscaping services in ${settings.serviceArea || 'your area'}`,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
        }
      : undefined,
    areaServed: settings.serviceArea || undefined,
    url: (() => {
      const raw = process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
      return raw.startsWith('http') ? raw : `https://${raw}`
    })(),
    logo: logoUrl || undefined,
    image: photoUrl || undefined,
    priceRange: '$$',
    sameAs: [
      settings.facebook,
      settings.instagram,
      settings.linkedin,
      settings.youtube,
      settings.yelp,
      settings.google,
    ].filter(Boolean),
  }

  return (
    <>
      <StructuredData data={structuredData} />

      {/* Hero Section */}
      <HeroSection
        mediaType={settings.heroMediaType === 'video' ? 'video' : 'slider'}
        images={heroImages}
        videoUrl={heroVideoUrl}
        headline={settings.heroHeadline || 'Transform Your Outdoor Living Space'}
        subheadline={settings.heroSubheadline}
      />

      {/* Empty state when no content sections have data */}
      {featuredProjects.length === 0 && activeServices.length === 0 && featuredTestimonials.length === 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4 font-heading">
              Welcome to {companyName}
            </h2>
            <p className="text-lg text-secondary">
              Our portfolio is being updated. Check back soon to see our projects, services, and client testimonials.
            </p>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4 font-heading">
                Our Work
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Explore our portfolio of completed projects and see the quality
                craftsmanship we bring to every landscape.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProjects.map((project) => (
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

            <div className="text-center mt-12">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Overview Section */}
      {activeServices.length > 0 && (
        <section className="py-16 lg:py-24 bg-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4 font-heading">
                Our Services
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                From design to installation, we offer a full range of landscaping
                and outdoor living services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {activeServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  slug={service.slug.current}
                  title={service.name}
                  image={sanityImageUrl(service.image)}
                  tagline={service.tagline}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All Services
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {featuredTestimonials.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-4 font-heading">
                What Our Clients Say
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Don&apos;t just take our word for it — hear from our satisfied
                customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredTestimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard
                  key={testimonial._id}
                  clientName={testimonial.clientName}
                  clientLocation={testimonial.clientLocation}
                  clientPhoto={sanityImageUrl(testimonial.clientPhoto)}
                  quote={testimonial.quote}
                  rating={testimonial.rating || 5}
                  projectType={testimonial.projectType}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-700 transition-colors"
              >
                Read More Reviews
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Preview Section */}
      <section className="py-16 lg:py-24 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={companyName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              {settings.aboutHeadline && (
                <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-6 font-heading">
                  {settings.aboutHeadline}
                </h2>
              )}
              {settings.aboutText && (
                <div className="prose prose-lg text-secondary mb-8">
                  <p>
                    {settings.aboutText.slice(0, 400)}
                    {settings.aboutText.length > 400 ? '...' : ''}
                  </p>
                </div>
              )}

              {/* Stats */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  {stats.slice(0, 3).map((stat, index) => (
                    <div key={index}>
                      <div className="text-3xl lg:text-4xl font-bold text-accent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-secondary">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Learn More About Us
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection companyName={companyName} phone={settings.phone} />
    </>
  )
}
