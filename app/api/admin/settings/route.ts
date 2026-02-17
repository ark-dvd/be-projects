import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient, getSanityClient } from '@/lib/sanity'
import { validate, SiteSettingsInputSchema } from '@/lib/validations'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

type SiteSettingsInput = z.output<typeof SiteSettingsInputSchema>

const SETTINGS_ID = 'siteSettings'

// Build image reference object for Sanity
// Validates asset ID is an image type — rejects file-type IDs to prevent type leakage
function buildImageRef(assetId: string | undefined | null) {
  if (!assetId || typeof assetId !== 'string') return undefined
  // Reject file-type IDs in image fields
  if (assetId.startsWith('file-')) {
    console.warn('[Settings] Rejected file-type asset ID in image field:', assetId)
    return undefined
  }
  const ref = assetId.startsWith('image-') ? assetId : `image-${assetId}`
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: ref
    }
  }
}

// Build file reference object for Sanity (for videos)
// Validates asset ID is a file type — rejects image-type IDs to prevent type leakage
function buildFileRef(assetId: string | undefined | null) {
  if (!assetId || typeof assetId !== 'string') return undefined
  // Reject image-type IDs in file fields
  if (assetId.startsWith('image-')) {
    console.warn('[Settings] Rejected image-type asset ID in file field:', assetId)
    return undefined
  }
  const ref = assetId.startsWith('file-') ? assetId : `file-${assetId}`
  return {
    _type: 'file',
    asset: {
      _type: 'reference',
      _ref: ref
    }
  }
}

function buildFields(d: SiteSettingsInput, includeMedia: boolean = false) {
  const fields: Record<string, unknown> = {
    // siteTitle: only include if explicitly provided (admin UI doesn't have this field yet,
    // so Zod defaults to '' — don't overwrite existing value with empty string)
    ...(d.siteTitle ? { siteTitle: d.siteTitle } : {}),
    heroHeadline: d.heroHeadline || '',
    heroSubheadline: d.heroSubheadline || '',
    heroMediaType: d.heroMediaType || 'images',
    contractorName: d.contractorName || '',
    contractorTitle: d.contractorTitle || '',
    aboutHeadline: d.aboutHeadline || '',
    aboutSubtitle: d.aboutSubtitle || '',
    teamClosingHeadline: d.teamClosingHeadline || '',
    teamClosingText: d.teamClosingText || '',
    aboutText: d.aboutText || '',
    aboutStats: d.aboutStats?.map(s => ({
      _type: 'object' as const,
      _key: Math.random().toString(36).substring(7),
      value: s.value,
      label: s.label,
    })) || [],
    phone: d.phone || '',
    email: d.email || '',
    address: d.address || '',
    serviceArea: d.serviceArea || '',
    officeHours: d.officeHours || '',
    instagram: d.instagram || '',
    facebook: d.facebook || '',
    linkedin: d.linkedin || '',
    youtube: d.youtube || '',
    yelp: d.yelp || '',
    google: d.google || '',
    houzz: d.houzz || '',
    nextdoor: d.nextdoor || '',
    licenseNumber: d.licenseNumber || '',
    licenseState: d.licenseState || '',
    insuranceInfo: d.insuranceInfo || '',
    bondInfo: d.bondInfo || '',
    termsOfService: d.termsOfService || '',
    privacyPolicy: d.privacyPolicy || '',
    projectsPageHeadline: d.projectsPageHeadline || '',
    projectsPageDescription: d.projectsPageDescription || '',
    servicesPageHeadline: d.servicesPageHeadline || '',
    servicesPageDescription: d.servicesPageDescription || '',
    testimonialsPageHeadline: d.testimonialsPageHeadline || '',
    testimonialsPageDescription: d.testimonialsPageDescription || '',
    faqPageHeadline: d.faqPageHeadline || '',
    faqPageDescription: d.faqPageDescription || '',
    contactPageHeadline: d.contactPageHeadline || '',
    contactPageDescription: d.contactPageDescription || '',
    heroCtaPrimaryText: d.heroCtaPrimaryText || '',
    heroCtaSecondaryText: d.heroCtaSecondaryText || '',
    ctaSectionHeadline: d.ctaSectionHeadline || '',
    ctaSectionDescription: d.ctaSectionDescription || '',
    ctaSectionButtonText: d.ctaSectionButtonText || '',
    headerCtaText: d.headerCtaText || '',
  }

  // Handle teamMembers array with image sub-fields
  if (d.teamMembers && d.teamMembers.length > 0) {
    fields.teamMembers = d.teamMembers.map((member: any, index: number) => ({
      _type: 'teamMember',
      _key: `team-member-${index}-${Math.random().toString(36).substring(7)}`,
      name: member.name || '',
      title: member.title || '',
      subtitle: member.subtitle || '',
      focus: member.focus || '',
      linkedinUrl: member.linkedinUrl || '',
      email: member.email || '',
      ...(member.photo && member.photo.assetId ? {
        photo: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: member.photo.assetId.startsWith('image-') ? member.photo.assetId : `image-${member.photo.assetId}`,
          },
        },
      } : {}),
    }))
  } else if (d.teamMembers !== undefined) {
    fields.teamMembers = []
  }

  // CRITICAL: Only include media fields if they were explicitly provided
  // This prevents overwriting existing media with empty values
  if (includeMedia) {
    if (d.logo) {
      fields.logo = buildImageRef(d.logo)
    }
    if (d.favicon) {
      fields.favicon = buildImageRef(d.favicon)
    }
    if (d.contractorPhoto) {
      fields.contractorPhoto = buildImageRef(d.contractorPhoto)
    }
    if (d.heroVideo) {
      fields.heroVideo = buildFileRef(d.heroVideo)
    }
    if (d.heroImages && Array.isArray(d.heroImages) && d.heroImages.length > 0) {
      fields.heroImages = d.heroImages
        .map((img: string | { assetId?: string; alt?: string }, index: number) => {
          const assetId = typeof img === 'string' ? img : img.assetId
          if (!assetId) return null
          const alt = typeof img === 'string' ? '' : (img.alt || '')
          // Validate: reject file-type IDs in image array
          if (assetId.startsWith('file-')) {
            console.warn('[Settings] Rejected file-type ID in heroImages:', assetId)
            return null
          }
          const ref = assetId.startsWith('image-') ? assetId : `image-${assetId}`
          return {
            _type: 'image',
            _key: `hero-image-${index}-${Math.random().toString(36).substring(7)}`,
            alt,
            asset: { _type: 'reference', _ref: ref }
          }
        })
        .filter(Boolean)
    }
  }

  // Enforce mutual exclusivity: when heroMediaType is set,
  // clear the unused media type so stale data doesn't persist
  const mediaType = fields.heroMediaType as string
  if (mediaType === 'video' && !fields.heroImages) {
    // Switching to video — clear images array
    fields.heroImages = []
  }
  if (mediaType === 'images' && !fields.heroVideo) {
    // Switching to images — unset video by setting to empty
    // (Sanity patch .set with undefined is a no-op, so we omit heroVideo entirely)
  }

  return fields
}

export async function GET(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const client = getSanityClient()
    const data = await client.fetch(`
      *[_type == "siteSettings" && _id in [$id, "drafts." + $id]][0] {
        _id,
        _createdAt,
        _updatedAt,
        siteTitle,
        heroHeadline,
        heroSubheadline,
        heroMediaType,
        contractorName,
        contractorTitle,
        aboutHeadline,
        aboutSubtitle,
        aboutText,
        aboutStats,
        "teamMembers": teamMembers[] {
          name,
          title,
          subtitle,
          focus,
          "photoUrl": photo.asset->url,
          "photoAssetId": photo.asset._ref,
          linkedinUrl,
          email
        },
        teamClosingHeadline,
        teamClosingText,
        phone,
        email,
        address,
        serviceArea,
        officeHours,
        instagram,
        facebook,
        linkedin,
        youtube,
        yelp,
        google,
        houzz,
        nextdoor,
        licenseNumber,
        licenseState,
        insuranceInfo,
        bondInfo,
        termsOfService,
        privacyPolicy,
        projectsPageHeadline,
        projectsPageDescription,
        servicesPageHeadline,
        servicesPageDescription,
        testimonialsPageHeadline,
        testimonialsPageDescription,
        faqPageHeadline,
        faqPageDescription,
        contactPageHeadline,
        contactPageDescription,
        heroCtaPrimaryText,
        heroCtaSecondaryText,
        ctaSectionHeadline,
        ctaSectionDescription,
        ctaSectionButtonText,
        headerCtaText,
        "logoUrl": logo.asset->url,
        "logoAssetId": logo.asset._ref,
        "faviconUrl": favicon.asset->url,
        "faviconAssetId": favicon.asset._ref,
        "contractorPhotoUrl": contractorPhoto.asset->url,
        "contractorPhotoAssetId": contractorPhoto.asset._ref,
        "heroImageUrls": heroImages[] { "url": asset->url, "assetId": asset._ref, alt },
        "heroVideoUrl": heroVideo.asset->url,
        "heroVideoAssetId": heroVideo.asset._ref
      }
    `, { id: SETTINGS_ID })
    return NextResponse.json(data || {})
  } catch (e) {
    console.error('Fetch settings error:', e)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    console.log('[Settings POST] Received payload:', JSON.stringify(body, null, 2))

    const v = validate(SiteSettingsInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    const client = getSanityWriteClient()

    // Check if any media fields were provided
    const hasMedia = !!(d.logo || d.favicon || d.contractorPhoto || d.heroVideo ||
                       (d.heroImages && d.heroImages.length > 0))

    const fields = buildFields(d, hasMedia)
    console.log('[Settings POST] Built fields:', JSON.stringify(fields, null, 2))

    // FIX (A2): createIfNotExists alone never updates existing documents.
    // Ensure document exists first, then patch to apply changes.
    await client.createIfNotExists({
      _id: SETTINGS_ID,
      _type: 'siteSettings' as const,
    })
    const result = await client.patch(SETTINGS_ID).set(fields).commit()

    console.log('[Settings POST] Sanity result:', result._id)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[Settings POST] Save failed:', msg)
    // Distinguish Sanity API errors from other errors
    const isSanityError = msg.includes('sanity') || msg.includes('Mutation')
    return NextResponse.json(
      { error: 'Failed to save settings', errorCode: isSanityError ? 'SANITY_ERROR' : 'INTERNAL_ERROR' },
      { status: isSanityError ? 502 : 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitError = withRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    console.log('[Settings PUT] Received payload:', JSON.stringify(body, null, 2))

    const v = validate(SiteSettingsInputSchema, body)
    if (!v.success) {
      return NextResponse.json({ error: 'Validation failed', details: v.errors }, { status: 400 })
    }

    const d = v.data
    const client = getSanityWriteClient()

    // Check if any media fields were provided
    const hasMedia = !!(d.logo || d.favicon || d.contractorPhoto || d.heroVideo ||
                       (d.heroImages && d.heroImages.length > 0))

    const fields = buildFields(d, hasMedia)
    console.log('[Settings PUT] Built fields with media:', hasMedia, JSON.stringify(fields, null, 2))

    // FIX (A2): Ensure document exists before patching — patch on non-existent doc throws 500.
    // Same pattern as already-fixed CRM settings route.
    await client.createIfNotExists({
      _id: SETTINGS_ID,
      _type: 'siteSettings' as const,
    })
    const result = await client.patch(SETTINGS_ID).set(fields).commit()

    console.log('[Settings PUT] Sanity result:', result._id)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[Settings PUT] Update failed:', msg)
    const isSanityError = msg.includes('sanity') || msg.includes('Mutation')
    return NextResponse.json(
      { error: 'Failed to update settings', errorCode: isSanityError ? 'SANITY_ERROR' : 'INTERNAL_ERROR' },
      { status: isSanityError ? 502 : 500 }
    )
  }
}

// No DELETE for settings - it's a singleton
