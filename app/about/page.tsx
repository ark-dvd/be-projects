import { Metadata } from 'next'
import Image from 'next/image'
import {
  Wrench,
  Shield,
  Clock,
  Star,
  Award,
  Users,
  CheckCircle,
  MapPin,
  BadgeCheck,
} from 'lucide-react'
import { getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import CTASection from '@/components/CTASection'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.contractorName || 'Contractor'

  return {
    title: `About ${name} | Our Story`,
    description: settings.aboutHeadline || `Learn about ${name} and our commitment to quality craftsmanship and exceptional service.`,
  }
}

// Auto-assign icons based on stat label keywords
function getStatIcon(label: string) {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('year') || lowerLabel.includes('experience')) return Clock
  if (lowerLabel.includes('project') || lowerLabel.includes('complete')) return CheckCircle
  if (lowerLabel.includes('insur') || lowerLabel.includes('licens')) return Shield
  if (lowerLabel.includes('rating') || lowerLabel.includes('star') || lowerLabel.includes('review')) return Star
  if (lowerLabel.includes('award') || lowerLabel.includes('certified')) return Award
  if (lowerLabel.includes('client') || lowerLabel.includes('customer') || lowerLabel.includes('team')) return Users
  return Wrench
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  const contractorPhotoUrl = sanityImageUrl(settings.contractorPhoto)
  const companyName = settings.contractorName || 'Contractor'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <div className="relative">
              {contractorPhotoUrl ? (
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={contractorPhotoUrl}
                    alt={companyName}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-xl">
                  <span className="text-8xl font-bold text-white/20">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-500 rounded-2xl -z-10" />
            </div>

            {/* Text Content */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                {companyName}
              </h1>
              {settings.contractorTitle && (
                <p className="text-xl text-amber-600 font-medium mb-6">
                  {settings.contractorTitle}
                </p>
              )}
              {settings.aboutHeadline && (
                <p className="text-2xl text-gray-700 leading-relaxed">
                  {settings.aboutHeadline}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {settings.aboutStats && settings.aboutStats.length > 0 && (
        <section className="bg-amber-50 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {settings.aboutStats.map((stat, index) => {
                const Icon = getStatIcon(stat.label)
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                    <p className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* About Text Section */}
      {settings.aboutText && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-gray max-w-none">
              {settings.aboutText.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-gray-600 leading-relaxed mb-6 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      {settings.aboutStats && settings.aboutStats.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Choose {companyName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {settings.aboutStats.map((stat, index) => {
                const Icon = getStatIcon(stat.label)
                // Generate value proposition based on stat
                const descriptions: Record<string, string> = {
                  experience: 'Decades of hands-on expertise in residential construction and remodeling.',
                  projects: 'Hundreds of happy homeowners and beautiful transformations.',
                  insured: 'Complete peace of mind with comprehensive coverage.',
                  rating: 'Consistently earning top reviews from our clients.',
                  default: 'Committed to excellence in every project we undertake.',
                }
                const lowerLabel = stat.label.toLowerCase()
                let description = descriptions.default
                if (lowerLabel.includes('year') || lowerLabel.includes('experience')) {
                  description = descriptions.experience
                } else if (lowerLabel.includes('project') || lowerLabel.includes('complete')) {
                  description = descriptions.projects
                } else if (lowerLabel.includes('insur') || lowerLabel.includes('licens')) {
                  description = descriptions.insured
                } else if (lowerLabel.includes('rating') || lowerLabel.includes('star')) {
                  description = descriptions.rating
                }

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {stat.value} {stat.label}
                    </h3>
                    <p className="text-gray-600 text-sm">{description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Service Area Section */}
      {settings.serviceArea && (
        <section className="py-16 lg:py-20 bg-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <MapPin className="h-12 w-12 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Service Area
            </h2>
            <p className="text-2xl text-gray-300">
              Proudly serving the <span className="text-amber-400 font-semibold">{settings.serviceArea}</span>
            </p>
          </div>
        </section>
      )}

      {/* License & Insurance Section */}
      {(settings.licenseNumber || settings.insuranceInfo || settings.bondInfo) && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Licensed & Insured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* License */}
              {settings.licenseNumber && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Licensed Contractor
                  </h3>
                  <p className="text-gray-600">
                    #{settings.licenseNumber}
                    {settings.licenseState && ` — ${settings.licenseState}`}
                  </p>
                </div>
              )}

              {/* Insurance */}
              {settings.insuranceInfo && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Fully Insured
                  </h3>
                  <p className="text-gray-600">{settings.insuranceInfo}</p>
                </div>
              )}

              {/* Bond */}
              {settings.bondInfo && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bonded</h3>
                  <p className="text-gray-600">{settings.bondInfo}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <CTASection companyName={companyName} phone={settings.phone} />
    </>
  )
}
