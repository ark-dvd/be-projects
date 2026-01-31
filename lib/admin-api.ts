// Admin API fetch helpers
// These call the protected /api/admin/* routes (NOT public data-fetchers)

export class AdminAPIError extends Error {
  status: number
  details?: string[]

  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.name = 'AdminAPIError'
    this.status = status
    this.details = details
  }
}

export async function adminFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/admin/${endpoint}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new AdminAPIError('Unauthorized', 401)
    }
    if (res.status === 403) {
      throw new AdminAPIError('Forbidden', 403)
    }
    const err = await res.json().catch(() => ({}))
    throw new AdminAPIError(err.error || `API error: ${res.status}`, res.status)
  }

  return res.json()
}

export async function adminPost<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new AdminAPIError(
      err.error || `API error: ${res.status}`,
      res.status,
      err.details
    )
  }

  return res.json()
}

export async function adminPut<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new AdminAPIError(
      err.error || `API error: ${res.status}`,
      res.status,
      err.details
    )
  }

  return res.json()
}

export async function adminDelete(endpoint: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/${endpoint}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new AdminAPIError(err.error || `API error: ${res.status}`, res.status)
  }
}

export async function adminUpload(file: File): Promise<{ assetId: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new AdminAPIError(err.error || `Upload failed: ${res.status}`, res.status)
  }

  return res.json()
}
