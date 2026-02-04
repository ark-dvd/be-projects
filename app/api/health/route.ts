import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkReadiness, checkHealth } from '@/lib/readiness'

/**
 * INTERNAL HEALTH ENDPOINT
 * Phase 6: Operational Readiness & No-Surprise Deployment
 *
 * Access Control:
 * - Requires authenticated admin session
 * - OR internal request header (for load balancer/orchestrator)
 *
 * Response Contract:
 * - status: 'ready' | 'not_ready' (for full readiness)
 * - health: 'healthy' | 'unhealthy' (for quick health)
 * - reasons: array of machine-readable failure codes
 * - NO SECRETS in response
 */

// Internal access token for load balancers/orchestrators
// Must be set via environment variable - not hardcoded
const INTERNAL_HEALTH_TOKEN = process.env.INTERNAL_HEALTH_TOKEN

/**
 * Verify request is authorized:
 * 1. Valid admin session, OR
 * 2. Internal health token header (for infrastructure)
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Check for internal token header (load balancer / k8s probe)
  const internalToken = request.headers.get('X-Health-Token')
  if (INTERNAL_HEALTH_TOKEN && internalToken === INTERNAL_HEALTH_TOKEN) {
    return true
  }

  // Check for authenticated admin session
  const session = await getServerSession(authOptions)
  if (session?.user) {
    return true
  }

  return false
}

/**
 * GET /api/_health
 * Returns system readiness status
 *
 * Query params:
 * - mode=quick: Return only health check (fast, no full readiness scan)
 * - mode=full: Return full readiness check (default)
 */
export async function GET(request: NextRequest) {
  // Authorization check
  const authorized = await isAuthorized(request)

  if (!authorized) {
    // Return 401 but don't reveal endpoint exists to unauthenticated users
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Determine check mode
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') || 'full'

  if (mode === 'quick') {
    // Quick health check - minimal overhead
    const health = checkHealth()
    return NextResponse.json({
      status: health.status,
      timestamp: health.timestamp,
      checks: health.checks,
    })
  }

  // Full readiness check
  const readiness = checkReadiness()

  // Build response - NO SECRETS
  const response = {
    status: readiness.status,
    timestamp: readiness.timestamp,
    // Machine-readable failure codes
    failedRequired: readiness.failedRequired,
    failedOptional: readiness.failedOptional,
    // Summary for operators
    summary: readiness.status === 'ready'
      ? `System READY (${readiness.failedOptional.length} optional degraded)`
      : `System NOT READY: ${readiness.failedRequired.join(', ')}`,
    // Individual check results (no secret values)
    checks: readiness.checks.map((c) => ({
      name: c.name,
      code: c.code,
      required: c.required,
      status: c.status,
      message: c.message,
    })),
  }

  // Return appropriate HTTP status
  const httpStatus = readiness.status === 'ready' ? 200 : 503

  return NextResponse.json(response, { status: httpStatus })
}

/**
 * HEAD /api/_health
 * Quick health probe for load balancers
 * Returns 200 if healthy, 503 if not
 */
export async function HEAD(request: NextRequest) {
  // For HEAD requests, allow internal token OR skip auth for basic probe
  const internalToken = request.headers.get('X-Health-Token')
  if (INTERNAL_HEALTH_TOKEN && internalToken !== INTERNAL_HEALTH_TOKEN) {
    return new NextResponse(null, { status: 401 })
  }

  const health = checkHealth()
  const httpStatus = health.status === 'healthy' ? 200 : 503

  return new NextResponse(null, { status: httpStatus })
}
