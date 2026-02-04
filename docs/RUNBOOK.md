# Operational Runbook

**System**: Contractors GWS
**Phase**: 6 - Operational Readiness
**Last Updated**: 2026-02-03

---

## 1. System Health Check

### Health Endpoint

```
GET /api/_health
Authorization: Admin session OR X-Health-Token header
```

**Quick check** (for monitoring):
```bash
curl -H "X-Health-Token: $INTERNAL_HEALTH_TOKEN" https://your-domain.com/api/_health?mode=quick
```

**Full readiness check**:
```bash
curl -H "X-Health-Token: $INTERNAL_HEALTH_TOKEN" https://your-domain.com/api/_health?mode=full
```

**Response codes**:
- `200` - System ready
- `401` - Unauthorized (check token/session)
- `503` - System not ready (check `failedRequired` array)

---

## 2. What To Do If...

### 2.1 Sanity API Returns 401/403

**Symptoms**:
- CMS content not loading
- Admin dashboard shows errors
- Health check shows `SANITY_API_TOKEN_MISSING` or `SANITY_CONFIG_INVALID`

**Diagnosis**:
1. Check environment variable: `SANITY_API_TOKEN`
2. Verify token hasn't expired in Sanity dashboard
3. Check project ID matches: `NEXT_PUBLIC_SANITY_PROJECT_ID`

**Resolution**:
1. Generate new API token in [Sanity Manage](https://www.sanity.io/manage)
2. Update `SANITY_API_TOKEN` in deployment environment
3. Redeploy application
4. Verify with health endpoint

### 2.2 NEXTAUTH_SECRET Invalid / Session Errors

**Symptoms**:
- Admin login fails
- "Invalid token" errors
- Health check shows `NEXTAUTH_SECRET_MISSING`

**Diagnosis**:
1. Check `NEXTAUTH_SECRET` is set and non-empty
2. Verify secret hasn't changed between deployments (invalidates existing sessions)

**Resolution**:
1. If secret was rotated: All existing sessions will be invalidated (expected)
2. Generate new secret: `openssl rand -base64 32`
3. Update in deployment environment
4. Redeploy

**Note**: Changing NEXTAUTH_SECRET invalidates all active admin sessions.

### 2.3 Lead Submission Rate-Limited (429)

**Symptoms**:
- Contact form submissions returning 429
- Logs show `rate_limit_exceeded` events

**Diagnosis**:
1. Check abuse logs for pattern:
   ```json
   {"level":"warn","type":"abuse_event","event":"rate_limit_exceeded",...}
   ```
2. Identify dimension: `ip`, `fingerprint`, or `contact`

**Resolution**:
- **Legitimate traffic spike**: Rate limits are protective; wait for window to reset
- **Attack/abuse**: Rate limits working as intended; no action needed
- **False positive**: Review rate limit configuration in `lib/abuse-prevention.ts`

**Current limits** (PUBLIC_LEAD_RATE_LIMIT):
- IP: 5 requests per minute
- Fingerprint: 3 requests per minute
- Contact: 2 requests per minute (same email/phone)

### 2.4 Lead Submission Returns 503

**Symptoms**:
- Contact form shows "Service temporarily unavailable"
- Logs show `turnstile_misconfigured` events

**Diagnosis**:
1. Check `TURNSTILE_SECRET_KEY` is set in production
2. Verify key is valid in Cloudflare dashboard

**Resolution**:
1. Get Turnstile secret key from [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Set `TURNSTILE_SECRET_KEY` in production environment
3. Redeploy

**Important**: This is FAIL-CLOSED behavior. Without valid Turnstile configuration, lead submissions are blocked to prevent bot abuse.

### 2.5 Deployment Blocked by Missing Env Var

**Symptoms**:
- Build fails with readiness check errors
- Deployment pipeline reports NOT READY

**Diagnosis**:
Run locally:
```bash
npm run build
```

Check for missing required variables in output.

**Required Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID |
| `SANITY_API_TOKEN` | Yes | Sanity API token (write) |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth secret |
| `TURNSTILE_SECRET_KEY` | Production | Cloudflare Turnstile secret |

**Resolution**:
1. Identify missing variable from deployment logs
2. Add to deployment environment (Vercel, etc.)
3. Re-run deployment

---

## 3. Logs & Monitoring

### 3.1 Structured Log Format

All logs follow structured JSON format:

```json
{
  "level": "info|warn|error",
  "type": "readiness_check|abuse_event|...",
  "timestamp": "ISO-8601",
  ...fields
}
```

### 3.2 Abuse Event Logs

**Log type**: `abuse_event`

**Dimensions**:
- `rate_limit_exceeded` - Request exceeded rate limit
- `bot_verification_failed` - Turnstile verification failed
- `turnstile_misconfigured` - Missing/invalid Turnstile configuration

**Example**:
```json
{
  "level": "warn",
  "type": "abuse_event",
  "event": "rate_limit_exceeded",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "ip": "192.168.1.1",
  "path": "/api/crm/lead",
  "dimension": "ip",
  "limit": 5
}
```

### 3.3 Readiness Logs

**Log type**: `readiness_check`

**Example**:
```json
{
  "level": "info",
  "type": "readiness_check",
  "status": "ready",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "failedRequired": [],
  "failedOptional": ["TURNSTILE_CONFIG_MISSING_DEV"],
  "summary": "System READY (1 optional degraded)"
}
```

### 3.4 Where to Find Logs

| Platform | Location |
|----------|----------|
| Vercel | Project Dashboard → Logs |
| Local Dev | Terminal stdout/stderr |
| Docker | `docker logs <container>` |

---

## 4. Deployment Checklist

Before deploying to production:

- [ ] All required environment variables set
- [ ] `TURNSTILE_TEST_BYPASS` is NOT set (or empty)
- [ ] Health endpoint returns 200
- [ ] Turnstile configured with production keys
- [ ] Google OAuth callback URLs updated

---

## 5. Critical Contacts / Escalation

| Role | Contact | Responsibility |
|------|---------|----------------|
| CTO | [TBD] | Architecture decisions, security incidents |
| DevOps | [TBD] | Infrastructure, deployments |
| On-Call | [TBD] | Production incidents |

---

## 6. Recovery Procedures

### 6.1 Full System Restore

1. Verify all environment variables are set
2. Run health check: `GET /api/_health`
3. Check Sanity connectivity
4. Test admin login
5. Test lead submission (with Turnstile)

### 6.2 Rollback Procedure

1. Identify last known good deployment
2. Revert via deployment platform (Vercel rollback, etc.)
3. Verify health endpoint returns 200
4. Notify stakeholders

---

## Appendix A: Machine-Readable Failure Codes

| Code | Severity | Description |
|------|----------|-------------|
| `SANITY_PROJECT_ID_MISSING` | Required | Sanity project ID not configured |
| `SANITY_API_TOKEN_MISSING` | Required | Sanity API token not configured |
| `NEXTAUTH_SECRET_MISSING` | Required | NextAuth secret not configured |
| `GOOGLE_CLIENT_ID_MISSING` | Required | Google OAuth client ID missing |
| `GOOGLE_CLIENT_SECRET_MISSING` | Required | Google OAuth secret missing |
| `TURNSTILE_SECRET_KEY_MISSING` | Prod Only | Turnstile secret missing (production) |
| `SANITY_CONFIG_INVALID` | Required | Sanity configuration invalid |
| `SANITY_CONFIG_INCOMPLETE` | Required | Sanity configuration incomplete |
| `AUTH_CONFIG_INCOMPLETE` | Required | Auth providers not fully configured |
| `TURNSTILE_CONFIG_MISSING_PRODUCTION` | Required | Turnstile required in production |
| `TURNSTILE_CONFIG_MISSING_DEV` | Optional | Turnstile not configured (dev only) |
