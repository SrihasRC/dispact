export const API_BASE: string =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export type EventStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'FAILED'
  | 'DEAD_LETTER'

export interface EventItem {
  idempotencyKey: string
  eventType: string
  source: string
  status: EventStatus
  createdAt: string
  payload?: Record<string, unknown>
}

export interface SendEventRequest {
  idempotencyKey: string
  source: string
  eventType: string
  payload: Record<string, unknown>
}

export interface SendEventSuccessResponse {
  status: 'queued'
  eventId: string
  at: string
}

export interface SendEventDuplicateResponse {
  status: 'duplicate'
  eventId: string
}

export interface SimulateRequest {
  count: number
  eventType: string
  source: string
  priority: 'high' | 'normal' | 'low'
}

export interface SimulateSuccessResponse {
  enqueued: number
  simulationId: string
}

export interface HealthResponse {
  status: string
  uptime: number
}

export interface SendEventResult {
  success: boolean
  status: number
  data?: SendEventSuccessResponse
  duplicate?: SendEventDuplicateResponse
  error?: string
}

export interface SimulateResult {
  success: boolean
  status: number
  data?: SimulateSuccessResponse
  error?: string
}

interface ApiErrorBody {
  error?: string
  message?: string
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null
}

export async function sendEvent(
  req: SendEventRequest
): Promise<SendEventResult> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': req.idempotencyKey,
      },
      body: JSON.stringify({
        source: req.source,
        eventType: req.eventType,
        payload: req.payload,
      }),
    })

    const bodyText = await res.text()
    let parsed: unknown = null
    if (bodyText) {
      try {
        parsed = JSON.parse(bodyText)
      } catch {
        parsed = null
      }
    }

    if (res.status === 202 && parsed && typeof parsed === 'object') {
      return {
        success: true,
        status: 202,
        data: parsed as SendEventSuccessResponse,
      }
    }

    if (res.status === 409 && parsed && typeof parsed === 'object') {
      return {
        success: false,
        status: 409,
        duplicate: parsed as SendEventDuplicateResponse,
        error: 'Duplicate event detected (409 Conflict)',
      }
    }

    let errorMessage = `HTTP error ${res.status}`
    if (isApiErrorBody(parsed)) {
      errorMessage = parsed.message || parsed.error || errorMessage
    }

    return {
      success: false,
      status: res.status,
      error: errorMessage,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return {
      success: false,
      status: 0,
      error: `Failed to connect to API: ${message}`,
    }
  }
}

export async function runSimulator(
  req: SimulateRequest
): Promise<SimulateResult> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: req.count,
        eventType: req.eventType,
        source: req.source,
        priority: req.priority,
      }),
    })

    const bodyText = await res.text()
    let parsed: unknown = null
    if (bodyText) {
      try {
        parsed = JSON.parse(bodyText)
      } catch {
        parsed = null
      }
    }

    if (res.status === 202 && parsed && typeof parsed === 'object') {
      return {
        success: true,
        status: 202,
        data: parsed as SimulateSuccessResponse,
      }
    }

    let errorMessage = `HTTP error ${res.status}`
    if (isApiErrorBody(parsed)) {
      errorMessage = parsed.message || parsed.error || errorMessage
    }

    return {
      success: false,
      status: res.status,
      error: errorMessage,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return {
      success: false,
      status: 0,
      error: `Failed to connect to API: ${message}`,
    }
  }
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data: unknown = await res.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'status' in data &&
      typeof (data as Record<string, unknown>).status === 'string'
    ) {
      return data as HealthResponse
    }
    return null
  } catch {
    return null
  }
}

export async function fetchRecentEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/events`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const data: unknown = await res.json()
    if (Array.isArray(data)) {
      return data as EventItem[]
    }
    return []
  } catch {
    return []
  }
}

