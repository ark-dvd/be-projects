import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient } from '@/lib/sanity'
import { validate, LeadWebFormSchema } from '@/lib/validations'
import { withRateLimit } from '@/lib/rate-limit'

/**
 * PUBLIC endpoint for website contact form submissions
 * Creates a lead with origin: auto_website_form
 * Also creates an activity log entry
 */

// Rate limit: 5 submissions per minute per IP (prevent spam)
const FORM_RATE_LIMIT = { limit: 5, windowSeconds: 60 }

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, FORM_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  try {
    const body = await request.json()
    const v = validate(LeadWebFormSchema, body)

    if (!v.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: v.errors },
        { status: 400 }
      )
    }

    const data = v.data
    const client = getSanityWriteClient()
    const now = new Date().toISOString()

    // Create the lead document
    const leadDoc = {
      _type: 'lead' as const,
      fullName: data.fullName,
      email: data.email || '',
      phone: data.phone || '',
      origin: 'auto_website_form' as const,
      source: 'website_form',
      serviceType: data.serviceType || '',
      priority: 'medium' as const,
      status: 'new' as const,
      originalMessage: data.message || '',
      receivedAt: now,
      formId: data.formId || 'contact-page',
    }

    const lead = await client.create(leadDoc)

    // Create activity log entry
    const activityDoc = {
      _type: 'activity' as const,
      type: 'lead_created_auto',
      description: `Lead auto-created from website contact form`,
      timestamp: now,
      lead: { _type: 'reference' as const, _ref: lead._id },
      performedBy: 'system',
    }

    await client.create(activityDoc)

    return NextResponse.json({
      success: true,
      leadId: lead._id,
      message: 'Thank you! We will be in touch soon.',
    })
  } catch (error) {
    console.error('Create lead from form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    )
  }
}
