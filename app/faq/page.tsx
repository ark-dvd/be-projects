import { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { getFaqs, getSiteSettings } from '@/lib/data-fetchers'
import CTASection from '@/components/CTASection'
import { StructuredData } from '@/components/StructuredData'
import { FaqAccordion } from './FaqAccordion'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about our construction and renovation services, process, pricing, and more.',
}

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    getFaqs(),
    getSiteSettings(),
  ])

  const safeFaqs = faqs || []
  const companyName = settings.contractorName || 'Contractor'

  // Group FAQs by category
  const categories = new Map<string, typeof safeFaqs>()
  const uncategorized: typeof safeFaqs = []

  for (const faq of safeFaqs) {
    if (faq.category && faq.category.trim()) {
      const cat = faq.category.trim()
      if (!categories.has(cat)) {
        categories.set(cat, [])
      }
      categories.get(cat)!.push(faq)
    } else {
      uncategorized.push(faq)
    }
  }

  const hasCategories = categories.size > 0
  const categoryEntries = Array.from(categories.entries())

  // Build FAQPage structured data (Schema.org)
  const structuredData = safeFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: safeFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}

      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {settings.faqPageHeadline || 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {settings.faqPageDescription || 'Find answers to common questions about our services, process, and what to expect'}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {safeFaqs.length > 0 ? (
            hasCategories ? (
              /* Grouped by category */
              <div className="space-y-10">
                {categoryEntries.map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {category}
                    </h2>
                    <FaqAccordion items={items} />
                  </div>
                ))}
                {uncategorized.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Other
                    </h2>
                    <FaqAccordion items={uncategorized} />
                  </div>
                )}
              </div>
            ) : (
              /* Flat list — no categories */
              <FaqAccordion items={safeFaqs} />
            )
          ) : (
            <div className="text-center py-16 bg-white rounded-xl">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                FAQ coming soon — check back for answers to common questions!
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
