import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data-fetchers'

/** Resolve the canonical base URL with protocol guard */
export function getBaseUrl(): string {
  const raw = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  return raw.startsWith('http') ? raw : `https://${raw}`
}

/**
 * Build the shared OpenGraph fields every page needs:
 * url, siteName, and images (logo from Sanity).
 *
 * Spread this into every page's openGraph block so that
 * Next.js 14's full-replace merge strategy still keeps
 * og:image, og:url, and og:site_name present.
 */
export async function buildOgBase(path = '') {
  const settings = await getSiteSettings()
  const baseUrl = getBaseUrl()
  const siteName = settings.contractorName || 'BE Project Solutions'

  return {
    url: `${baseUrl}${path}`,
    siteName,
    ...(settings.logoUrl
      ? { images: [{ url: settings.logoUrl, width: 1200, height: 630, alt: siteName }] }
      : {}),
  }
}
