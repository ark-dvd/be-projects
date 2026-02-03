import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, ClientInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type ClientInput = z.output<typeof ClientInputSchema>

function buildClientFields(d: ClientInput) {
  return {
    fullName: d.fullName,
    email: d.email || '',
    phone: d.phone || '',
    address: d.address || '',
    status: d.status,
    preferredContact: d.preferredContact || undefined,
    internalNotes: d.internalNotes || '',
    propertyType: d.propertyType || '',
    sourceLead: d.sourceLeadId
      ? { _type: 'reference' as const, _ref: d.sourceLeadId }
      : undefined,
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
      *[_type == "client" ${statusFilter}] | order(clientSince desc) [$offset...$end] {
        _id,
        _createdAt,
        fullName,
        email,
        phone,
        address,
        status,
        clientSince,
        preferredContact,
        internalNotes,
        propertyType,
        "sourceLead": sourceLead->{_id, fullName},
        "dealCount": count(*[_type == "deal" && client._ref == ^._id]),
        "totalValue": math::sum(*[_type == "deal" && client._ref == ^._id].value)
      }
    `, { offset, end: offset + limit })

    const totalCount = await client.fetch(`
      count(*[_type == "client" ${statusFilter}])
    `)

    const statusCounts = await client.fetch(`{
      "active": count(*[_type == "client" && status == "active"]),
      "past": count(*[_type == "client" && status == "past"]),
      "total": count(*[_type == "client"])
    }`)

    return NextResponse.json({
      clients: data || [],
      total: totalCount,
      statusCounts,
      pagination: { offset, limit, hasMore: offset + limit < totalCount }
    })
  } catch (e) {
    console.error('Fetch clients error:', e)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(ClientInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    const writeClient = getSanityWriteClient()
    const readClient = getSanityClient()
    const now = new Date().toISOString()

    const fields = buildClientFields(d)

    // PHASE 3: Atomic transaction - all entities + Activities commit together or not at all (DOC-030, DOC-040)
    const clientId = `client.${crypto.randomUUID()}`
    const clientActivityId = `activity.${crypto.randomUUID()}`

    const transaction = writeClient.transaction()

    // 1. Create client
    transaction.create({
      _id: clientId,
      _type: 'client' as const,
      ...fields,
      clientSince: now,
    })

    // 2. Create client activity
    transaction.create({
      _id: clientActivityId,
      _type: 'activity' as const,
      type: d.sourceLeadId ? 'converted_to_client' : 'client_created_manual',
      description: d.sourceLeadId
        ? `Lead converted to client by ${auth.user.email}`
        : `Client manually created by ${auth.user.email}`,
      timestamp: now,
      client: { _type: 'reference' as const, _ref: clientId },
      ...(d.sourceLeadId && { lead: { _type: 'reference' as const, _ref: d.sourceLeadId } }),
      performedBy: auth.user.email,
    })

    // If converting from lead, add lead updates + lead activity to same transaction
    if (d.sourceLeadId) {
      // Get current lead status for activity metadata
      const currentLead = await readClient.fetch(
        `*[_type == "lead" && _id == $id][0]{status}`,
        { id: d.sourceLeadId }
      )
      const previousLeadStatus = currentLead?.status

      const leadActivityId = `activity.${crypto.randomUUID()}`

      // 3. Patch lead status and link to client
      transaction.patch(d.sourceLeadId, {
        set: {
          convertedToClient: { _type: 'reference' as const, _ref: clientId },
          status: 'won'
        }
      })

      // 4. Create lead activity
      transaction.create({
        _id: leadActivityId,
        _type: 'activity' as const,
        type: 'lead_converted',
        description: `Lead converted to client "${d.fullName}" by ${auth.user.email}`,
        timestamp: now,
        lead: { _type: 'reference' as const, _ref: d.sourceLeadId },
        client: { _type: 'reference' as const, _ref: clientId },
        performedBy: auth.user.email,
        metadata: {
          oldStatus: previousLeadStatus,
          newClientId: clientId,
        },
      })
    }

    // Commit all operations atomically
    await transaction.commit()

    // Fetch and return created client
    const result = await readClient.fetch(
      `*[_type == "client" && _id == $id][0]`,
      { id: clientId }
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error('Create client error:', e)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const v = validate(ClientInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    if (!d._id) {
      return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 })
    }

    const readClient = getSanityClient()
    const writeClient = getSanityWriteClient()

    // PHASE 3: Get current client to detect status change
    const currentClient = await readClient.fetch(
      `*[_type == "client" && _id == $id][0]{status}`,
      { id: d._id }
    )

    const statusChanged = currentClient && currentClient.status !== d.status
    const fields = buildClientFields(d)

    // PHASE 3: Atomic transaction - patch + Activity commit together or not at all (DOC-030, DOC-040)
    if (statusChanged) {
      const activityId = `activity.${crypto.randomUUID()}`
      const transaction = writeClient.transaction()
      transaction.patch(d._id, { set: fields })
      transaction.create({
        _id: activityId,
        _type: 'activity' as const,
        type: 'status_changed',
        description: `Client status changed from "${currentClient.status}" to "${d.status}"`,
        timestamp: new Date().toISOString(),
        client: { _type: 'reference' as const, _ref: d._id },
        performedBy: auth.user.email,
        metadata: {
          oldStatus: currentClient.status,
          newStatus: d.status,
        },
      })
      await transaction.commit()
    } else {
      // No status change - simple patch without Activity
      await writeClient.patch(d._id).set(fields).commit()
    }

    // Fetch and return updated client
    const result = await readClient.fetch(
      `*[_type == "client" && _id == $id][0]`,
      { id: d._id }
    )

    return NextResponse.json(result)
  } catch (e) {
    console.error('Update client error:', e)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
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

    // Check if client has any deals
    const dealCount = await sanityClient.fetch(
      `count(*[_type == "deal" && client._ref == $id])`,
      { id }
    )

    if (dealCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing deals. Delete deals first.' },
        { status: 400 }
      )
    }

    // PHASE 3: Activities are immutable - do NOT delete them (DOC-030 § 3.5)
    // Activities remain as historical audit records even after client deletion

    await writeClient.delete(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete client error:', e)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
