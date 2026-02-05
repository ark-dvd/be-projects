import { MetadataRoute } from 'next'
import { getProjects, getServices } from '@/lib/data-fetchers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'

  // Static pages
  const staticPages = [
    '',
    '/projects',
    '/services',
    '/testimonials',
    '/about',
    '/contact',
  ]

  // Fetch dynamic content
  const [projects, services] = await Promise.all([
    getProjects(),
    getServices(),
  ])

  // Dynamic project pages
  const projectPages = (projects || [])
    .map((p) => {
      const slug = typeof p.slug === 'string' ? p.slug : p.slug?.current
      return slug ? `/projects/${slug}` : null
    })
    .filter((p): p is string => p !== null)

  // Dynamic service pages
  const servicePages = (services || [])
    .map((s) => {
      const slug = typeof s.slug === 'string' ? s.slug : s.slug?.current
      return slug ? `/services/${slug}` : null
    })
    .filter((s): s is string => s !== null)

  // Combine all pages
  const allPages = [...staticPages, ...projectPages, ...servicePages]

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.split('/').length === 2 ? 0.8 : 0.7,
  }))
}
