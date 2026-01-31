import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Quote, Star, ArrowRight } from 'lucide-react'
import { getTestimonials, getProjects, getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import CTASection from '@/components/CTASection'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'Client Testimonials',
  description: 'Read testimonials from homeowners who trusted us with their construction and renovation projects. See why our clients recommend us.',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
      {initials}
    </div>
  )
}

export default async function TestimonialsPage() {
  const [testimonials, projects, settings] = await Promise.all([
    getTestimonials(),
    getProjects(),
    getSiteSettings(),
  ])

  // Sort: featured first, then by order
  const sortedTestimonials = [...testimonials].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return (a.order || 0) - (b.order || 0)
  })

  // Calculate stats
  const totalReviews = testimonials.length
  const ratingsWithValue = testimonials.filter((t) => t.rating)
  const averageRating = ratingsWithValue.length > 0
    ? ratingsWithValue.reduce((sum, t) => sum + (t.rating || 0), 0) / ratingsWithValue.length
    : 5
  const fiveStarCount = testimonials.filter((t) => t.rating === 5).length

  // Create a map of project IDs to slugs for linking
  const projectSlugMap = new Map(
    projects.map((p) => [p._id, p.slug.current])
  )

  const companyName = settings.contractorName || 'Contractor'

  // Build structured data for reviews
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HomeImprovement',
    name: companyName,
    aggregateRating: totalReviews > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: averageRating.toFixed(1),
          reviewCount: totalReviews,
          bestRating: 5,
        }
      : undefined,
    review: sortedTestimonials.slice(0, 10).map((t) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.clientName,
      },
      reviewRating: t.rating
        ? {
            '@type': 'Rating',
            ratingValue: t.rating,
          }
        : undefined,
      reviewBody: t.quote,
      datePublished: t.date || undefined,
    })),
  }

  return (
    <>
      <StructuredData data={structuredData} />

      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Client Testimonials
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear from homeowners who trusted us with their projects
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      {totalReviews > 0 && (
        <section className="bg-amber-50 py-8 border-b border-amber-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
              {/* Average Rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                  <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>

              {/* Total Reviews */}
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>

              {/* 5-Star Reviews */}
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{fiveStarCount}</p>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials List */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedTestimonials.length > 0 ? (
            <div className="space-y-8">
              {sortedTestimonials.map((testimonial) => {
                const photoUrl = sanityImageUrl(testimonial.clientPhoto)
                const projectSlug = testimonial.project?._ref
                  ? projectSlugMap.get(testimonial.project._ref)
                  : null
                const formattedDate = testimonial.date
                  ? new Date(testimonial.date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : null

                return (
                  <article
                    key={testimonial._id}
                    className="bg-white rounded-2xl shadow-sm p-8 relative"
                  >
                    {/* Featured Badge */}
                    {testimonial.isFeatured && (
                      <div className="absolute -top-3 left-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-amber-200 mb-4" />

                    {/* Quote Text */}
                    <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="mb-6">
                        <StarRating rating={testimonial.rating} />
                      </div>
                    )}

                    {/* Client Info */}
                    <div className="flex items-center gap-4">
                      {/* Photo or Avatar */}
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={testimonial.clientName}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <InitialsAvatar name={testimonial.clientName} />
                      )}

                      {/* Details */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {testimonial.clientName}
                        </p>
                        {testimonial.clientLocation && (
                          <p className="text-sm text-gray-500">
                            {testimonial.clientLocation}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          {testimonial.projectType && (
                            <span className="text-sm text-amber-600 font-medium">
                              {testimonial.projectType}
                            </span>
                          )}
                          {formattedDate && (
                            <span className="text-sm text-gray-400">
                              {formattedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Project Link */}
                    {projectSlug && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <Link
                          href={`/projects/${projectSlug}`}
                          className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors"
                        >
                          View Project
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <Quote className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Testimonials coming soon!
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
