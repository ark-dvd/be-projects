import { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const rawUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  return {
    title: 'Accessibility Statement',
    description: 'Accessibility commitment and WCAG 2.1 Level AA conformance statement for BE Project Solutions LLC.',
    alternates: {
      canonical: `${baseUrl}/accessibility`,
    },
  }
}

export default function AccessibilityPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-lg text-gray-300">
            BE Project Solutions LLC
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-10">
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                BE Project Solutions LLC is committed to ensuring digital accessibility
                for people with disabilities. We continually improve the user experience
                for everyone and apply the relevant accessibility standards.
              </p>

              <h2 className="text-xl font-bold text-dark mt-8 mb-4 font-heading">
                Conformance Status
              </h2>
              <p>
                We aim to conform to WCAG 2.1 Level AA. We regularly review our site
                to identify and fix accessibility barriers.
              </p>

              <h2 className="text-xl font-bold text-dark mt-8 mb-4 font-heading">
                Feedback
              </h2>
              <p>
                If you encounter accessibility barriers on our website, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:contact@beprojectsolutions.com"
                    className="text-primary hover:text-primary-700 transition-colors"
                  >
                    contact@beprojectsolutions.com
                  </a>
                </li>
                <li>
                  Phone:{' '}
                  <a
                    href="tel:5125549190"
                    className="text-primary hover:text-primary-700 transition-colors"
                  >
                    (512) 554-9190
                  </a>
                </li>
              </ul>
              <p>We aim to respond to accessibility feedback within 5 business days.</p>

              <h2 className="text-xl font-bold text-dark mt-8 mb-4 font-heading">
                Last Review
              </h2>
              <p>Last Accessibility Review: February 17, 2026</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
