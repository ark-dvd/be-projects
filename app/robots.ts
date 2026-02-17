import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://www.beprojectsolutions.com'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
