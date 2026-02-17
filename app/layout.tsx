import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Montserrat, Open_Sans } from 'next/font/google'
import { getSiteSettings } from '@/lib/data-fetchers'
import { sanityImageUrl } from '@/lib/sanity-helpers'
import { isSanityConfigured } from '@/lib/sanity'
import PublicLayout from '@/components/PublicLayout'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
})

// ISR: revalidate public pages every 5 minutes
// Admin routes have their own force-dynamic in app/admin/layout.tsx
export const revalidate = 300

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

  const faviconUrl = sanityImageUrl(settings.favicon) || sanityImageUrl(settings.logo)

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
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  const isDemo = !isSanityConfigured()
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') || ''

  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <script
          nonce={nonce}
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-X13B7WS1E9"
        />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-X13B7WS1E9');
            `,
          }}
        />
      </head>
      <body className="bg-light text-dark antialiased font-body">
        {/* Hidden form for Netlify Forms detection */}
        <form name="contact" data-netlify="true" hidden>
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="tel" name="phone" />
          <input type="text" name="service" />
          <textarea name="message" />
        </form>
        <PublicLayout settings={settings} isDemo={isDemo}>
          {children}
        </PublicLayout>
      </body>
    </html>
  )
}
