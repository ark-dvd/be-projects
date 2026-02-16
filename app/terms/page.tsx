import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data-fetchers'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const rawUrl = process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  return {
    title: 'Terms of Service',
    description: `Terms of Service for ${settings.contractorName || 'our company'}.`,
    alternates: {
      canonical: `${baseUrl}/terms`,
    },
  }
}

export default async function TermsPage() {
  const settings = await getSiteSettings()
  const companyName = settings.contractorName || 'Contractor'
  const content = settings.termsOfService || ''

  if (!content) {
    return null
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-300">
            {companyName}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-10">
            <div className="prose prose-gray max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
