import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60
import { getServices, getSiteSettings } from '@/lib/data-fetchers'
import ContactForm from '@/components/ContactForm'
import { StructuredData } from '@/components/StructuredData'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.contractorName || 'BE-Project Solutions'
  const rawUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  return {
    title: 'Contact Us | Get a Free Quote',
    description: `Ready to start your landscaping project? Contact ${name} for a free consultation and estimate. We serve the ${settings.serviceArea || 'local area'}.`,
    openGraph: {
      title: `Contact ${name} | Get a Free Quote`,
      description: `Ready to start your landscaping project? Contact ${name} for a free consultation and estimate.`,
    },
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
  }
}

// Social media icon components
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function YelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 2.364 3.252 1.073 1.073 0 0 1-.694 1.46zm-3.965 5.835a1.073 1.073 0 0 1-.932 1.418 9.195 9.195 0 0 1-3.98-.477 1.072 1.072 0 0 1-.535-1.49l2.396-4.588c.483-.925 1.893-.63 1.893.398v4.74zm-8.098-1.065l4.357-2.478c.874-.498 1.805.518 1.248 1.364l-2.863 4.34a1.072 1.072 0 0 1-1.633.14 9.194 9.194 0 0 1-1.853-3.028 1.072 1.072 0 0 1 .744-1.338zm-2.44-4.906a9.194 9.194 0 0 1 .405-3.985 1.073 1.073 0 0 1 1.477-.56l4.612 2.34c.923.47.65 1.87-.367 1.879l-5.017.035a1.072 1.072 0 0 1-1.11-1.71zm5.523-7.79a9.194 9.194 0 0 1 1.92 3.536 1.072 1.072 0 0 1-.592 1.295l-4.51 1.893c-.903.38-1.737-.632-1.12-1.358l3.181-3.749a1.072 1.072 0 0 1 1.121-.617z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  )
}

function HouzzIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.518 6.802V0L4.319 4.164v10.073L.001 16.38V24l8.199-4.357v-6.271L12.518 11v6.182l-4.318 2.353V24l8.199-4.164V9.764L24 5.6V0z" />
    </svg>
  )
}

function NextdoorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.141c0 .69-.56 1.25-1.25 1.25h-2.008c-.69 0-1.25-.56-1.25-1.25v-4.219c0-.893-.725-1.617-1.618-1.617s-1.617.724-1.617 1.617v4.219c0 .69-.56 1.25-1.25 1.25H6.894c-.69 0-1.25-.56-1.25-1.25V9.516c0-.69.56-1.25 1.25-1.25h2.007c.59 0 1.084.409 1.216.958a4.106 4.106 0 0 1 3.651 0c.132-.549.626-.958 1.216-.958h2.007c.69 0 1.25.56 1.25 1.25v6.625z" />
    </svg>
  )
}

export default async function ContactPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ])

  // Transform services for the form
  const serviceOptions = (services || []).map((s) => ({
    _id: s._id,
    name: s.name,
  }))

  const companyName = settings.contractorName || 'Contractor'

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      ...(settings.phone ? { telephone: settings.phone } : {}),
      ...(settings.email ? { email: settings.email } : {}),
      contactType: 'customer service',
      ...(settings.serviceArea ? { areaServed: settings.serviceArea } : {}),
      availableLanguage: 'English',
    },
  }

  // Collect social links
  const socialLinks = [
    { url: settings.instagram, icon: InstagramIcon, label: 'Instagram' },
    { url: settings.facebook, icon: FacebookIcon, label: 'Facebook' },
    { url: settings.linkedin, icon: LinkedInIcon, label: 'LinkedIn' },
    { url: settings.youtube, icon: YouTubeIcon, label: 'YouTube' },
    { url: settings.yelp, icon: YelpIcon, label: 'Yelp' },
    { url: settings.google, icon: GoogleIcon, label: 'Google' },
    { url: settings.houzz, icon: HouzzIcon, label: 'Houzz' },
    { url: settings.nextdoor, icon: NextdoorIcon, label: 'Nextdoor' },
  ].filter((link) => link.url)

  return (
    <>
      <StructuredData data={contactSchema} />

      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            {settings.contactPageHeadline || 'Get In Touch'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {settings.contactPageDescription || "Ready to start your landscaping project? We'd love to hear from you."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-dark mb-6 font-heading">
                Send Us a Message
              </h2>
              <ContactForm services={serviceOptions} />
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-8">
              {/* Contact Details Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-dark mb-6 font-heading">
                  Contact Information
                </h2>
                <dl className="space-y-6">
                  {/* Phone */}
                  {settings.phone && (
                    <div>
                      <dt className="flex items-start gap-4 text-sm text-secondary mb-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        Phone
                      </dt>
                      <dd className="ml-14">
                        <a
                          href={`tel:${settings.phone.replace(/\D/g, '')}`}
                          className="text-lg font-medium text-dark hover:text-primary transition-colors"
                        >
                          {settings.phone}
                        </a>
                      </dd>
                    </div>
                  )}

                  {/* Email */}
                  {settings.email && (
                    <div>
                      <dt className="flex items-start gap-4 text-sm text-secondary mb-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        Email
                      </dt>
                      <dd className="ml-14">
                        <a
                          href={`mailto:${settings.email}`}
                          className="text-lg font-medium text-dark hover:text-primary transition-colors break-all"
                        >
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  )}

                  {/* Address */}
                  {settings.address && (
                    <div>
                      <dt className="flex items-start gap-4 text-sm text-secondary mb-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        Address
                      </dt>
                      <dd className="ml-14 text-lg font-medium text-dark whitespace-pre-line">
                        {settings.address}
                      </dd>
                    </div>
                  )}

                  {/* Service Area */}
                  {settings.serviceArea && (
                    <div>
                      <dt className="flex items-start gap-4 text-sm text-secondary mb-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        Service Area
                      </dt>
                      <dd className="ml-14 text-lg font-medium text-dark">
                        {settings.serviceArea}
                      </dd>
                    </div>
                  )}

                  {/* Office Hours */}
                  {settings.officeHours && (
                    <div>
                      <dt className="flex items-start gap-4 text-sm text-secondary mb-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        Office Hours
                      </dt>
                      <dd className="ml-14 text-dark whitespace-pre-line">
                        {settings.officeHours}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-secondary mb-4">
                      Follow Us
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-light rounded-full flex items-center justify-center text-secondary hover:bg-primary-100 hover:text-primary transition-colors"
                          aria-label={link.label}
                        >
                          <link.icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="bg-primary-100 rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <p className="text-dark font-medium mb-1">Map</p>
                <p className="text-sm text-primary-800">
                  Service Area: {settings.serviceArea || companyName}
                </p>
                <p className="text-xs text-primary-800 mt-2">
                  Google Maps integration coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
