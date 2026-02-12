import type { Metadata } from 'next'
import Script from 'next/script'
import { getSiteSettings } from '@/lib/data-fetchers'
import { isSanityConfigured } from '@/lib/sanity'
import PublicLayout from '@/components/PublicLayout'
import './globals.css'

// Force dynamic rendering for all pages to ensure CSP nonces match
// Per DOC-040: strict-dynamic CSP requires nonces to match at request time
// Trade-off: No ISR caching, but guaranteed CSP compliance
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.contractorName || 'BE-Project Solutions'
  const description = settings.aboutText?.slice(0, 160) || 'Professional landscaping and outdoor services in North Austin'

  // Ensure URL has a protocol — NEXTAUTH_URL on Netlify may be bare hostname
  const rawUrl = process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  // Extract OG image from contractor photo if available as a URL string
  const photoVal = settings.contractorPhoto as unknown
  const contractorPhotoUrl = typeof photoVal === 'string' && photoVal.startsWith('http')
    ? photoVal
    : undefined

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: settings.siteTitle || siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      siteName,
      'landscaping', 'landscape design', 'hardscape', 'drainage solutions',
      'North Austin', 'Cedar Park', 'Leander', 'Georgetown',
      settings.serviceArea || 'Greater Austin Area',
      'outdoor living', 'lawn maintenance', 'landscape contractor',
    ].filter(Boolean),
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName,
      title: settings.siteTitle || siteName,
      description,
      ...(contractorPhotoUrl ? {
        images: [{ url: contractorPhotoUrl, width: 1200, height: 630, alt: siteName }],
      } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteTitle || siteName,
      description,
      ...(contractorPhotoUrl ? {
        images: [contractorPhotoUrl],
      } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  const isDemo = !isSanityConfigured()

  return (
    <html lang="en">
      <body className="bg-light text-dark antialiased font-body">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-X13B7WS1E9" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X13B7WS1E9');
          `}
        </Script>
        <PublicLayout settings={settings} isDemo={isDemo}>
          {children}
        </PublicLayout>
      </body>
    </html>
  )
}
