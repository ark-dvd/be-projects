import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, DealInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type DealInput = z.output<typeof DealInputSchema>

// PHASE 2 (A3): Fetch CRM settings for config-driven validation
const CRM_SETTINGS_ID = 'crmSettings'

interface DealStatusStage {
  key: string
  label: string
  color: string
}

interface CrmSettingsData {
  dealStatuses?: DealStatusStage[]
}

// Default deal statuses (fallback if settings not configured)
const DEFAULT_DEAL_STATUSES: DealStatusStage[] = [
  { key: 'planning', label: 'Planning', color: '#f59e0b' },
  { key: 'permitting', label: 'Permitting', color: '#6366f1' },
  { key: 'in_progress', label: 'In Progress', color: '#10b981' },
  { key: 'inspection', label: 'Final Inspection', color: '#14b8a6' },
  { key: 'completed', label: 'Completed', color: '#059669' },
  { key: 'warranty', label: 'Warranty Period', color: '#6b7280' },
  { key: 'paused', label: 'Paused', color: '#ef4444' },
  { key: 'cancelled', label: 'Cancelled', color: '#374151' },
]

// Active statuses for pipeline value calculation
const ACTIVE_STATUS_KEYS = ['planning', 'permitting', 'in_progress', 'inspection']

async function getCrmSettings(client: ReturnType<typeof getSanityClient>): Promise<CrmSettingsData> {
  const settings = await client.fetch(`
    *[_type == "crmSettings" && _id == $id][0] {
      dealStatuses
    }
  `, { id: CRM_SETTINGS_ID })
  return settings || {}
}

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

    // PHASE 2 (A3): Dynamic statusCounts from settings.dealStatuses
    const settings = await getCrmSettings(client)
    const statuses = settings.dealStatuses?.length ? settings.dealStatuses : DEFAULT_DEAL_STATUSES

    // Build dynamic GROQ query for status counts
    const statusCountsQuery = statuses.map(s => `"${s.key}": count(*[_type == "deal" && status == "${s.key}"])`).join(',\n      ')
    const statusCounts = await client.fetch(`{
      ${statusCountsQuery},
      "total": count(*[_type == "deal"])
    }`)

    // Calculate total pipeline value (using known active statuses)
    const pipelineValue = await client.fetch(`
      math::sum(*[_type == "deal" && status in $activeStatuses].value)
    `, { activeStatuses: ACTIVE_STATUS_KEYS })

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
    const readClient = getSanityClient()
    const client = getSanityWriteClient()

    // PHASE 2 (A3): Validate status against settings.dealStatuses (fail-closed)
    const settings = await getCrmSettings(readClient)
    const statuses = settings.dealStatuses?.length ? settings.dealStatuses : DEFAULT_DEAL_STATUSES
    const validStatusKeys = statuses.map(s => s.key)

    if (d.status && !validStatusKeys.includes(d.status)) {
      return NextResponse.json({
        error: 'Validation failed',
        details: [`status: Invalid status "${d.status}". Valid values: ${validStatusKeys.join(', ')}`]
      }, { status: 400 })
    }

    const now = new Date().toISOString()

    const fields = buildDealFields(d)

    // PHASE 3: Atomic transaction - deal + Activity commit together or not at all (DOC-030, DOC-040)
    const dealId = `deal.${crypto.randomUUID()}`
    const activityId = `activity.${crypto.randomUUID()}`

    const transaction = client.transaction()
    transaction.create({
      _id: dealId,
      _type: 'deal' as const,
      ...fields,
    })
    transaction.create({
      _id: activityId,
      _type: 'activity' as const,
      type: 'deal_created',
      description: `Project "${d.title}" created by ${auth.user.email}`,
      timestamp: now,
      deal: { _type: 'reference' as const, _ref: dealId },
      client: { _type: 'reference' as const, _ref: d.clientId },
      performedBy: auth.user.email,
    })

    await transaction.commit()

    // Fetch and return created deal
    const result = await readClient.fetch(
      `*[_type == "deal" && _id == $id][0]`,
      { id: dealId }
    )

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

    // PHASE 2 (A3): Validate status against settings.dealStatuses (fail-closed)
    const settings = await getCrmSettings(sanityClient)
    const statuses = settings.dealStatuses?.length ? settings.dealStatuses : DEFAULT_DEAL_STATUSES
    const validStatusKeys = statuses.map(s => s.key)

    if (d.status && !validStatusKeys.includes(d.status)) {
      return NextResponse.json({
        error: 'Validation failed',
        details: [`status: Invalid status "${d.status}". Valid values: ${validStatusKeys.join(', ')}`]
      }, { status: 400 })
    }

    // Get current deal to check for status change
    const currentDeal = await sanityClient.fetch(
      `*[_type == "deal" && _id == $id][0]{status, title, client}`,
      { id: d._id }
    )

    const statusChanged = currentDeal && currentDeal.status !== d.status
    const fields = buildDealFields(d)

    // PHASE 3: Atomic transaction - patch + Activity commit together or not at all (DOC-030, DOC-040)
    if (statusChanged) {
      const activityId = `activity.${crypto.randomUUID()}`
      const activityType = d.status === 'completed' ? 'deal_completed' : 'status_changed'
      const transaction = writeClient.transaction()
      transaction.patch(d._id, { set: fields })
      transaction.create({
        _id: activityId,
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
      await transaction.commit()
    } else {
      // No status change - simple patch without Activity
      await writeClient.patch(d._id).set(fields).commit()
    }

    // Fetch and return updated deal
    const result = await sanityClient.fetch(
      `*[_type == "deal" && _id == $id][0]`,
      { id: d._id }
    )

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

    // PHASE 3: Activities are immutable - do NOT delete them (DOC-030 § 3.5)
    // Activities remain as historical audit records even after deal deletion

    await writeClient.delete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete deal error:', e)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
