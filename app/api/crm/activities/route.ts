import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, ActivityInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type ActivityInput = z.output<typeof ActivityInputSchema>

function buildActivityFields(d: ActivityInput, performedBy: string) {
  return {
    type: d.type,
    description: d.description || '',
    timestamp: new Date().toISOString(),
    lead: d.leadId ? { _type: 'reference' as const, _ref: d.leadId } : undefined,
    client: d.clientId ? { _type: 'reference' as const, _ref: d.clientId } : undefined,
    deal: d.dealId ? { _type: 'reference' as const, _ref: d.dealId } : undefined,
    performedBy: d.performedBy || performedBy,
    metadata: d.metadata || undefined,
  }
}

export async function GET(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const client = getSanityClient()
    const url = new URL(request.url)
    const leadId = url.searchParams.get('leadId')
    const clientId = url.searchParams.get('clientId')
    const dealId = url.searchParams.get('dealId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filters = ''
    if (leadId) filters += ` && lead._ref == "${leadId}"`
    if (clientId) filters += ` && client._ref == "${clientId}"`
    if (dealId) filters += ` && deal._ref == "${dealId}"`

    const data = await client.fetch(`
      *[_type == "activity" ${filters}] | order(timestamp desc) [$offset...$end] {
        _id,
        type,
        description,
        timestamp,
        "lead": lead->{_id, fullName},
        "client": client->{_id, fullName},
        "deal": deal->{_id, title},
        performedBy,
        metadata
      }
    `, { offset, end: offset + limit })

    const totalCount = await client.fetch(`
      count(*[_type == "activity" ${filters}])
    `)

    return NextResponse.json({
      activities: data || [],
      total: totalCount,
      pagination: { offset, limit, hasMore: offset + limit < totalCount }
    })
  } catch (e) {
    console.error('Fetch activities error:', e)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(ActivityInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data

    // Require at least one entity reference
    if (!d.leadId && !d.clientId && !d.dealId) {
      return NextResponse.json(
        { error: 'Activity must be linked to a lead, client, or deal' },
        { status: 400 }
      )
    }

    const client = getSanityWriteClient()
    const fields = buildActivityFields(d, auth.user.email)
    const doc = {
      _type: 'activity' as const,
      ...fields,
    }

    const result = await client.create(doc)
    return NextResponse.json(result)
  } catch (e) {
    console.error('Create activity error:', e)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id || !/^[a-zA-Z0-9._-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    await getSanityWriteClient().delete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete activity error:', e)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
