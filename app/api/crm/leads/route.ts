import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, LeadInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type LeadInput = z.output<typeof LeadInputSchema>

function buildLeadFields(d: LeadInput) {
  return {
    fullName: d.fullName,
    email: d.email || '',
    phone: d.phone || '',
    origin: d.origin,
    source: d.source || '',
    serviceType: d.serviceType || '',
    estimatedValue: d.estimatedValue || undefined,
    priority: d.priority,
    status: d.status,
    referredBy: d.referredBy || '',
    originalMessage: d.originalMessage || '',
    description: d.description || '',
    internalNotes: d.internalNotes || '',
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
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const statusFilter = status && status !== 'all' ? `&& status == "${status}"` : ''

    const data = await client.fetch(`
      *[_type == "lead" ${statusFilter}] | order(receivedAt desc) [$offset...$end] {
        _id,
        _createdAt,
        fullName,
        email,
        phone,
        origin,
        source,
        serviceType,
        estimatedValue,
        priority,
        status,
        referredBy,
        originalMessage,
        description,
        internalNotes,
        receivedAt,
        "convertedToClient": convertedToClient->{_id, fullName}
      }
    `, { offset, end: offset + limit })

    // Get total count for pagination
    const totalCount = await client.fetch(`
      count(*[_type == "lead" ${statusFilter}])
    `)

    // Get counts by status for filter badges
    const statusCounts = await client.fetch(`{
      "new": count(*[_type == "lead" && status == "new"]),
      "contacted": count(*[_type == "lead" && status == "contacted"]),
      "site_visit": count(*[_type == "lead" && status == "site_visit"]),
      "quoted": count(*[_type == "lead" && status == "quoted"]),
      "negotiating": count(*[_type == "lead" && status == "negotiating"]),
      "won": count(*[_type == "lead" && status == "won"]),
      "lost": count(*[_type == "lead" && status == "lost"]),
      "total": count(*[_type == "lead"])
    }`)

    return NextResponse.json({
      leads: data || [],
      total: totalCount,
      statusCounts,
      pagination: { offset, limit, hasMore: offset + limit < totalCount }
    })
  } catch (e) {
    console.error('Fetch leads error:', e)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(LeadInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    const client = getSanityWriteClient()
    const now = new Date().toISOString()

    const fields = buildLeadFields(d)
    const doc = {
      _type: 'lead' as const,
      ...fields,
      receivedAt: now,
    }

    const result = await client.create(doc)

    // Create activity log
    await client.create({
      _type: 'activity' as const,
      type: 'lead_created_manual',
      description: `Lead manually created by ${auth.user.email}`,
      timestamp: now,
      lead: { _type: 'reference' as const, _ref: result._id },
      performedBy: auth.user.email,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('Create lead error:', e)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(LeadInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    if (!d._id) {
      return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 })
    }

    const client = getSanityWriteClient()

    // Get current lead to check for status change
    const currentLead = await getSanityClient().fetch(
      `*[_type == "lead" && _id == $id][0]{status}`,
      { id: d._id }
    )

    const fields = buildLeadFields(d)
    const result = await client.patch(d._id).set(fields).commit()

    // Log activity if status changed
    if (currentLead && currentLead.status !== d.status) {
      await client.create({
        _type: 'activity' as const,
        type: 'status_changed',
        description: `Status changed from "${currentLead.status}" to "${d.status}"`,
        timestamp: new Date().toISOString(),
        lead: { _type: 'reference' as const, _ref: d._id },
        performedBy: auth.user.email,
        metadata: {
          oldStatus: currentLead.status,
          newStatus: d.status,
        },
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('Update lead error:', e)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
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

    const client = getSanityWriteClient()

    // Also delete related activities
    const activities = await getSanityClient().fetch(
      `*[_type == "activity" && lead._ref == $id]._id`,
      { id }
    )

    // Delete activities first
    for (const actId of activities) {
      await client.delete(actId)
    }

    // Delete lead
    await client.delete(id)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete lead error:', e)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
