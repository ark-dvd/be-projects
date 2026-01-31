import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { getSanityWriteClient } from '@/lib/sanity'

// Simple in-memory rate limiting
const uploadCounts = new Map<string, { count: number; resetAt: number }>()
const MAX_UPLOADS_PER_MINUTE = 10

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = uploadCounts.get(userId)

  if (!userLimit || now > userLimit.resetAt) {
    uploadCounts.set(userId, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (userLimit.count >= MAX_UPLOADS_PER_MINUTE) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  // Rate limiting
  if (!checkRateLimit(auth.user.id)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 10 uploads per minute.' },
      { status: 429 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}` },
        { status: 400 }
      )
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Max size: ${maxMB}MB` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const client = getSanityWriteClient()

    // Upload as 'image' for images, 'file' for videos
    const assetType = isImage ? 'image' : 'file'
    const asset = await client.assets.upload(assetType, buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
      type: assetType,
      filename: file.name,
    })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
