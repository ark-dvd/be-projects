import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, DealInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type DealInput = z.output<typeof DealInputSchema>

function buildDealFields(d: DealInput) {
  return {
    title: d.title,
    client: { _type: 'reference' as const, _ref: d.clientId },
    dealType: d.dealType || '',
    value: d.value || undefined,
    status: d.status,
    projectAddress: d.projectAddress || '',
    permitNumber: d.permitNumber || '',
    estimatedDuration: d.estimatedDuration || '',
    scope: d.scope || [],
    contractSignedDate: d.contractSignedDate || undefined,
    startDate: d.startDate || undefined,
    expectedEndDate: d.expectedEndDate || undefined,
    actualEndDate: d.actualEndDate || undefined,
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
    const clientId = url.searchParams.get('clientId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filters = ''
    if (status && status !== 'all') filters += ` && status == "${status}"`
    if (clientId) filters += ` && client._ref == "${clientId}"`

    const data = await client.fetch(`
      *[_type == "deal" ${filters}] | order(startDate desc) [$offset...$end] {
        _id,
        _createdAt,
        title,
        "client": client->{_id, fullName, email, phone},
        dealType,
        value,
        status,
        projectAddress,
        permitNumber,
        estimatedDuration,
        scope,
        contractSignedDate,
        startDate,
        expectedEndDate,
        actualEndDate,
        description,
        internalNotes
      }
    `, { offset, end: offset + limit })

    const totalCount = await client.fetch(`
      count(*[_type == "deal" ${filters}])
    `)

    const statusCounts = await client.fetch(`{
      "planning": count(*[_type == "deal" && status == "planning"]),
      "permitting": count(*[_type == "deal" && status == "permitting"]),
      "in_progress": count(*[_type == "deal" && status == "in_progress"]),
      "inspection": count(*[_type == "deal" && status == "inspection"]),
      "completed": count(*[_type == "deal" && status == "completed"]),
      "warranty": count(*[_type == "deal" && status == "warranty"]),
      "paused": count(*[_type == "deal" && status == "paused"]),
      "cancelled": count(*[_type == "deal" && status == "cancelled"]),
      "total": count(*[_type == "deal"])
    }`)

    // Calculate total pipeline value
    const pipelineValue = await client.fetch(`
      math::sum(*[_type == "deal" && status in ["planning", "permitting", "in_progress", "inspection"]].value)
    `)

    return NextResponse.json({
      deals: data || [],
      total: totalCount,
      statusCounts,
      pipelineValue: pipelineValue || 0,
      pagination: { offset, limit, hasMore: offset + limit < totalCount }
    })
  } catch (e) {
    console.error('Fetch deals error:', e)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(DealInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    const client = getSanityWriteClient()
    const now = new Date().toISOString()

    const fields = buildDealFields(d)
    const doc = {
      _type: 'deal' as const,
      ...fields,
    }

    const result = await client.create(doc)

    // Create activity log
    await client.create({
      _type: 'activity' as const,
      type: 'deal_created',
      description: `Project "${d.title}" created by ${auth.user.email}`,
      timestamp: now,
      deal: { _type: 'reference' as const, _ref: result._id },
      client: { _type: 'reference' as const, _ref: d.clientId },
      performedBy: auth.user.email,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('Create deal error:', e)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(DealInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    if (!d._id) {
      return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 })
    }

    const sanityClient = getSanityClient()
    const writeClient = getSanityWriteClient()

    // Get current deal to check for status change
    const currentDeal = await sanityClient.fetch(
      `*[_type == "deal" && _id == $id][0]{status, title, client}`,
      { id: d._id }
    )

    const fields = buildDealFields(d)
    const result = await writeClient.patch(d._id).set(fields).commit()

    // Log activity if status changed
    if (currentDeal && currentDeal.status !== d.status) {
      const activityType = d.status === 'completed' ? 'deal_completed' : 'status_changed'
      await writeClient.create({
        _type: 'activity' as const,
        type: activityType,
        description: `Project status changed from "${currentDeal.status}" to "${d.status}"`,
        timestamp: new Date().toISOString(),
        deal: { _type: 'reference' as const, _ref: d._id },
        client: currentDeal.client,
        performedBy: auth.user.email,
        metadata: {
          oldStatus: currentDeal.status,
          newStatus: d.status,
        },
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('Update deal error:', e)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
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

    const sanityClient = getSanityClient()
    const writeClient = getSanityWriteClient()

    // Delete related activities
    const activities = await sanityClient.fetch(
      `*[_type == "activity" && deal._ref == $id]._id`,
      { id }
    )

    for (const actId of activities) {
      await writeClient.delete(actId)
    }

    await writeClient.delete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete deal error:', e)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
