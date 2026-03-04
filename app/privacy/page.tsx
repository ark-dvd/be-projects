import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data-fetchers'
import { buildOgBase } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, ogBase] = await Promise.all([getSiteSettings(), buildOgBase('/privacy')])

  return {
    title: 'Privacy Policy',
    description: `Privacy Policy for ${settings.contractorName || 'our company'}.`,
    openGraph: {
      ...ogBase,
      title: `Privacy Policy | ${settings.contractorName || 'BE Project Solutions'}`,
      description: `Privacy Policy for ${settings.contractorName || 'our company'}.`,
    },
    alternates: {
      canonical: ogBase.url,
    },
  }
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings()
  const companyName = settings.contractorName || 'Contractor'
  const content = settings.privacyPolicy || ''

  if (!content) {
    return null
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/80">
            {companyName}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-10">
            <div className="prose max-w-none whitespace-pre-line text-secondary leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
