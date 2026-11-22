import { mockApi } from './mock'
import { ApiError, type ApiClient } from './types'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'
const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new ApiError({ status: 503, code: 'API_BASE_URL_MISSING', message: 'API Gateway base URL is not configured. Enable mock mode or set VITE_API_BASE_URL.' })
  }
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        code: payload?.code ?? (response.status === 401 ? 'UNAUTHORIZED' : response.status === 403 ? 'FORBIDDEN' : 'API_ERROR'),
        message: payload?.message ?? 'The API Gateway returned an error.',
        requestId: payload?.requestId,
      })
    }
    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError({ status: 408, code: 'REQUEST_TIMEOUT', message: 'The request timed out. Please try again.' })
    }
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Could not reach the API Gateway.' })
  } finally {
    window.clearTimeout(timeout)
  }
}

const contractPending = <T,>(): Promise<T> => Promise.reject(new ApiError({
  status: 501,
  code: 'GATEWAY_CONTRACT_PENDING',
  message: 'The API Gateway contract is not configured yet. Add the repository OpenAPI mappings before disabling mock mode.',
}))

// These methods intentionally do not invent endpoint paths. Map them to the existing
// gateway contract when OpenAPI is available; the reusable request() client above is
// ready for that wiring and keeps credentials/error handling centralized.
const realApi: ApiClient = {
  listEvents: () => contractPending(),
  getEvent: () => contractPending(),
  createReservation: () => contractPending(),
  getTickets: () => contractPending(),
  getNotifications: () => contractPending(),
  markNotificationRead: () => contractPending(),
  getOrganizerMetrics: () => contractPending(),
  getOrganizerEvents: () => contractPending(),
  getOperationsSummary: () => contractPending(),
}

export const api: ApiClient = useMocks ? mockApi : realApi
export const apiMode = useMocks ? 'MOCK MODE' : 'API GATEWAY'
