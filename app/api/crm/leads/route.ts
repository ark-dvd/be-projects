import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, LeadInputSchema, LeadPatchSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type LeadInput = z.output<typeof LeadInputSchema>
type LeadPatch = z.output<typeof LeadPatchSchema>

// PHASE 2 (A3): Fetch CRM settings for config-driven validation
const CRM_SETTINGS_ID = 'crmSettings'

interface PipelineStage {
  key: string
  label: string
  color: string
}

interface CrmSettingsData {
  pipelineStages?: PipelineStage[]
  leadSources?: string[]
  serviceTypes?: string[]
}

// Default pipeline stages (fallback if settings not configured)
const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { key: 'new', label: 'New Lead', color: '#fe5557' },
  { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
  { key: 'site_visit', label: 'Site Visit', color: '#6366f1' },
  { key: 'quoted', label: 'Quote Sent', color: '#f59e0b' },
  { key: 'negotiating', label: 'Negotiating', color: '#f97316' },
  { key: 'won', label: 'Won', color: '#10b981' },
  { key: 'lost', label: 'Lost', color: '#6b7280' },
]

// Default lead sources (fallback if settings not configured)
const DEFAULT_LEAD_SOURCES: string[] = [
  'Phone Call',
  'Referral',
  'Walk-in',
  'Yard Sign',
  'Home Show / Expo',
  'Returning Client',
  'Nextdoor',
  'Social Media',
  'Other',
]

// Default service types (fallback if settings not configured)
const DEFAULT_SERVICE_TYPES: string[] = [
  'Kitchen Remodel',
  'Bathroom Remodel',
  'Home Addition',
  'Deck / Patio',
  'Full Renovation',
  'ADU / Guest House',
  'Roofing',
  'Flooring',
  'Exterior / Siding',
  'Garage',
  'Basement Finish',
  'Commercial',
  'Other',
]

async function getCrmSettings(client: ReturnType<typeof getSanityClient>): Promise<CrmSettingsData> {
  const settings = await client.fetch(`
    *[_type == "crmSettings" && _id == $id][0] {
      pipelineStages,
      leadSources,
      serviceTypes
    }
  `, { id: CRM_SETTINGS_ID })
  return settings || {}
}

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
    // Soft-delete filter: exclude leads with deleted == true
    const deletedFilter = '&& deleted != true'

    const data = await client.fetch(`
      *[_type == "lead" ${statusFilter} ${deletedFilter}] | order(receivedAt desc) [$offset...$end] {
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

    // Get total count for pagination (excluding soft-deleted)
    const totalCount = await client.fetch(`
      count(*[_type == "lead" ${statusFilter} ${deletedFilter}])
    `)

    // PHASE 2 (A3): Dynamic statusCounts from settings.pipelineStages
    const settings = await getCrmSettings(client)
    const stages = settings.pipelineStages?.length ? settings.pipelineStages : DEFAULT_PIPELINE_STAGES

    // Build dynamic GROQ query for status counts (excluding soft-deleted)
    const statusCountsQuery = stages.map(s => `"${s.key}": count(*[_type == "lead" && status == "${s.key}" && deleted != true])`).join(',\n      ')
    const statusCounts = await client.fetch(`{
      ${statusCountsQuery},
      "total": count(*[_type == "lead" && deleted != true])
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
    const readClient = getSanityClient()
    const client = getSanityWriteClient()

    // PHASE 2 (A3): Validate status, source, serviceType against settings (fail-closed)
    const settings = await getCrmSettings(readClient)
    const stages = settings.pipelineStages?.length ? settings.pipelineStages : DEFAULT_PIPELINE_STAGES
    const validStatusKeys = stages.map(s => s.key)
    const validSources = settings.leadSources?.length ? settings.leadSources : DEFAULT_LEAD_SOURCES
    const validServiceTypes = settings.serviceTypes?.length ? settings.serviceTypes : DEFAULT_SERVICE_TYPES

    const validationErrors: string[] = []

    if (d.status && !validStatusKeys.includes(d.status)) {
      validationErrors.push(`status: Invalid status "${d.status}". Valid values: ${validStatusKeys.join(', ')}`)
    }

    if (d.source && !validSources.includes(d.source)) {
      validationErrors.push(`source: Invalid source "${d.source}". Valid values: ${validSources.join(', ')}`)
    }

    if (d.serviceType && !validServiceTypes.includes(d.serviceType)) {
      validationErrors.push(`serviceType: Invalid serviceType "${d.serviceType}". Valid values: ${validServiceTypes.join(', ')}`)
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }

    const now = new Date().toISOString()

    const fields = buildLeadFields(d)
    const doc = {
      _type: 'lead' as const,
      ...fields,
      receivedAt: now,
    }

    // PHASE 3: Atomic transaction - entity + Activity commit together or not at all (DOC-030, DOC-040)
    const leadId = `lead.${crypto.randomUUID()}`
    const activityId = `activity.${crypto.randomUUID()}`

    const transaction = client.transaction()
    transaction.create({
      ...doc,
      _id: leadId,
    })
    transaction.create({
      _id: activityId,
      _type: 'activity' as const,
      type: 'lead_created_manual',
      description: `Lead manually created by ${auth.user.email}`,
      timestamp: now,
      lead: { _type: 'reference' as const, _ref: leadId },
      performedBy: auth.user.email,
    })

    await transaction.commit()

    // Fetch and return created lead
    const result = await readClient.fetch(
      `*[_type == "lead" && _id == $id][0]`,
      { id: leadId }
    )

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

    const readClient = getSanityClient()
    const client = getSanityWriteClient()

    // PHASE 2 (A3): Validate status, source, serviceType against settings (fail-closed)
    const settings = await getCrmSettings(readClient)
    const stages = settings.pipelineStages?.length ? settings.pipelineStages : DEFAULT_PIPELINE_STAGES
    const validStatusKeys = stages.map(s => s.key)
    const validSources = settings.leadSources?.length ? settings.leadSources : DEFAULT_LEAD_SOURCES
    const validServiceTypes = settings.serviceTypes?.length ? settings.serviceTypes : DEFAULT_SERVICE_TYPES

    const validationErrors: string[] = []

    if (d.status && !validStatusKeys.includes(d.status)) {
      validationErrors.push(`status: Invalid status "${d.status}". Valid values: ${validStatusKeys.join(', ')}`)
    }

    if (d.source && !validSources.includes(d.source)) {
      validationErrors.push(`source: Invalid source "${d.source}". Valid values: ${validSources.join(', ')}`)
    }

    if (d.serviceType && !validServiceTypes.includes(d.serviceType)) {
      validationErrors.push(`serviceType: Invalid serviceType "${d.serviceType}". Valid values: ${validServiceTypes.join(', ')}`)
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }

    // Get current lead to check for status change
    const currentLead = await readClient.fetch(
      `*[_type == "lead" && _id == $id][0]{status}`,
      { id: d._id }
    )

    const statusChanged = currentLead && currentLead.status !== d.status
    const fields = buildLeadFields(d)

    // PHASE 3: Atomic transaction - patch + Activity commit together or not at all (DOC-030, DOC-040)
    if (statusChanged) {
      const activityId = `activity.${crypto.randomUUID()}`
      const transaction = client.transaction()
      transaction.patch(d._id, { set: fields })
      transaction.create({
        _id: activityId,
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
      await transaction.commit()
    } else {
      // No status change - simple patch without Activity
      await client.patch(d._id).set(fields).commit()
    }

    // Fetch and return updated lead
    const result = await readClient.fetch(
      `*[_type == "lead" && _id == $id][0]`,
      { id: d._id }
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error('Update lead error:', e)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

// PATCH: Partial update for status, priority, estimatedValue, etc.
// Does NOT require full Lead schema - only _id is required
export async function PATCH(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(LeadPatchSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const patch = v.data as LeadPatch
    const { _id, ...fields } = patch

    // Filter out undefined fields - only patch what's provided
    const patchFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patchFields[key] = value
      }
    }

    if (Object.keys(patchFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const readClient = getSanityClient()
    const client = getSanityWriteClient()

    // Verify lead exists (and is not soft-deleted)
    const existingLead = await readClient.fetch(
      `*[_type == "lead" && _id == $id && deleted != true][0]{_id, status, deleted}`,
      { id: _id }
    )

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // PHASE 2 (A3): Validate status against settings (if status is being patched)
    if (patchFields.status) {
      const settings = await getCrmSettings(readClient)
      const stages = settings.pipelineStages?.length ? settings.pipelineStages : DEFAULT_PIPELINE_STAGES
      const validStatusKeys = stages.map(s => s.key)

      if (!validStatusKeys.includes(patchFields.status as string)) {
        return NextResponse.json({
          error: 'Validation failed',
          details: [`status: Invalid status "${patchFields.status}". Valid values: ${validStatusKeys.join(', ')}`]
        }, { status: 400 })
      }
    }

    // Check for status change to create Activity
    const statusChanged = patchFields.status && existingLead.status !== patchFields.status

    // PHASE 3: Atomic transaction if status changed - patch + Activity (DOC-030, DOC-040)
    if (statusChanged) {
      const activityId = `activity.${crypto.randomUUID()}`
      const transaction = client.transaction()
      transaction.patch(_id, { set: patchFields })
      transaction.create({
        _id: activityId,
        _type: 'activity' as const,
        type: 'status_changed',
        description: `Status changed from "${existingLead.status}" to "${patchFields.status}"`,
        timestamp: new Date().toISOString(),
        lead: { _type: 'reference' as const, _ref: _id },
        performedBy: auth.user.email,
        metadata: {
          oldStatus: existingLead.status,
          newStatus: patchFields.status,
        },
      })
      await transaction.commit()
    } else {
      // No status change - simple patch
      await client.patch(_id).set(patchFields).commit()
    }

    // Fetch and return updated lead
    const result = await readClient.fetch(
      `*[_type == "lead" && _id == $id][0]`,
      { id: _id }
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error('Patch lead error:', e)
    return NextResponse.json({ error: 'Failed to patch lead' }, { status: 500 })
  }
}

// DELETE: Soft delete - sets deleted=true, deletedAt timestamp
// Does NOT hard-delete from Sanity - preserves referential integrity with Activities
export async function DELETE(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const id = new URL(request.url).searchParams.get('id')
    // Allow alphanumeric, dots, underscores, hyphens, and colons (for draft IDs like "drafts:lead.xxx")
    // Also allow UUIDs with dashes and any seeded/legacy ID formats
    if (!id || !/^[a-zA-Z0-9._:\-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
    }

    const readClient = getSanityClient()
    const client = getSanityWriteClient()

    // Verify lead exists and is not already soft-deleted
    const existingLead = await readClient.fetch(
      `*[_type == "lead" && _id == $id][0]{_id, deleted, fullName}`,
      { id }
    )

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (existingLead.deleted === true) {
      return NextResponse.json({ error: 'Lead is already deleted' }, { status: 400 })
    }

    const now = new Date().toISOString()

    // SOFT DELETE: Set deleted flag and timestamp
    // This preserves referential integrity with Activities (DOC-030 § 3.5)
    // Activities continue to reference this lead for audit trail purposes
    const activityId = `activity.${crypto.randomUUID()}`
    const transaction = client.transaction()

    // Mark lead as soft-deleted
    transaction.patch(id, {
      set: {
        deleted: true,
        deletedAt: now,
      }
    })

    // Create deletion activity for audit trail
    transaction.create({
      _id: activityId,
      _type: 'activity' as const,
      type: 'lead_deleted',
      description: `Lead "${existingLead.fullName}" was deleted`,
      timestamp: now,
      lead: { _type: 'reference' as const, _ref: id },
      performedBy: auth.user.email,
    })

    await transaction.commit()

    console.log(`[Leads API] Soft-deleted lead ${id}`)

    return NextResponse.json({ success: true, deleted: true, deletedAt: now })
  } catch (e) {
    console.error('Delete lead error:', e instanceof Error ? e.message : 'Unknown')
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
