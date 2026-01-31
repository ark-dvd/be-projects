import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAllowedAdmin } from './config'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  try {
    // ⚠️ CRITICAL: Must specify cookieName to match config.ts
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token', // MUST match cookies.sessionToken.name above
    })

    if (!token) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    if (!token.email) {
      return { error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }) }
    }
    if (!isAllowedAdmin(token.email)) {
      console.warn(`Admin API access denied: ${token.email}`)
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    return {
      user: {
        id: token.sub || 'admin',
        email: token.email,
        fullName: token.name || undefined,
      },
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return { error: NextResponse.json({ error: 'Auth failed' }, { status: 401 }) }
  }
}
