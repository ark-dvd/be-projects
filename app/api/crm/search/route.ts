import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityClient } from '@/lib/sanity'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * Global CRM search across leads, clients, and deals
 * Returns grouped results with max 5 items per category
 */

export async function GET(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({
        leads: [],
        clients: [],
        deals: [],
        total: 0,
      })
    }

    const client = getSanityClient()
    const searchTerm = `${query}*` // Wildcard search

    // Search across all CRM entities (excluding soft-deleted leads)
    const results = await client.fetch(`{
      "leads": *[_type == "lead" && deleted != true && (
        fullName match $q ||
        email match $q ||
        phone match $q ||
        description match $q ||
        originalMessage match $q ||
        internalNotes match $q
      )] | order(receivedAt desc) [0...5] {
        _id,
        fullName,
        email,
        phone,
        serviceType,
        status,
        origin,
        estimatedValue,
        receivedAt
      },

      "clients": *[_type == "client" && (
        fullName match $q ||
        email match $q ||
        phone match $q ||
        address match $q ||
        internalNotes match $q
      )] | order(clientSince desc) [0...5] {
        _id,
        fullName,
        email,
        phone,
        status,
        "dealCount": count(*[_type == "deal" && client._ref == ^._id])
      },

      "deals": *[_type == "deal" && (
        title match $q ||
        description match $q ||
        projectAddress match $q ||
        permitNumber match $q ||
        internalNotes match $q
      )] | order(startDate desc) [0...5] {
        _id,
        title,
        "clientName": client->fullName,
        dealType,
        value,
        status
      }
    }`, { q: searchTerm })

    const totalCount =
      (results.leads?.length || 0) +
      (results.clients?.length || 0) +
      (results.deals?.length || 0)

    return NextResponse.json({
      leads: results.leads || [],
      clients: results.clients || [],
      deals: results.deals || [],
      total: totalCount,
      query,
    })
  } catch (e) {
    console.error('CRM search error:', e)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
