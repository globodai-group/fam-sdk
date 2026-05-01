/**
 * Base error class for all SDK errors
 */
export class FamError extends Error {
  public override readonly name: string = 'FamError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Allowlist for ApiError.details. The remote API response body may contain
 * sensitive material (internal IDs, tokens, full Mangopay payloads) that
 * consumers tend to ship to Sentry/console as soon as they catch and log
 * the error. We persist only the fields needed to reason about the failure.
 */
const API_ERROR_DETAILS_ALLOWLIST = ['message', 'code', 'errors'] as const

function sanitizeApiErrorDetails(raw: unknown): Record<string, unknown> | undefined {
  if (raw === null || typeof raw !== 'object') {
    return undefined
  }
  const source = raw as Record<string, unknown>
  const safe: Record<string, unknown> = {}
  for (const key of API_ERROR_DETAILS_ALLOWLIST) {
    if (key in source) {
      safe[key] = source[key]
    }
  }
  return Object.keys(safe).length === 0 ? undefined : safe
}

/**
 * API error with status code and response details
 */
export class ApiError extends FamError {
  public override readonly name: string = 'ApiError'
  public readonly statusCode: number
  public readonly code: string | undefined
  public readonly details: Record<string, unknown> | undefined

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = sanitizeApiErrorDetails(details)
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  public override readonly name: string = 'AuthenticationError'

  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
  public override readonly name: string = 'AuthorizationError'

  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends ApiError {
  public override readonly name: string = 'NotFoundError'

  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

/**
 * Validation error with field-level details (400/422)
 */
export class ValidationError extends ApiError {
  public override readonly name: string = 'ValidationError'
  public readonly errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 422, 'VALIDATION_ERROR', { errors })
    this.errors = errors
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
  public override readonly name: string = 'RateLimitError'
  public readonly retryAfter: number | undefined

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.retryAfter = retryAfter
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends FamError {
  public override readonly name: string = 'NetworkError'
  public readonly originalError: Error | undefined

  constructor(message: string, originalError?: Error) {
    super(message)
    this.originalError = originalError
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends NetworkError {
  public override readonly name: string = 'TimeoutError'

  constructor(message = 'Request timeout', originalError?: Error) {
    super(message, originalError)
  }
}

/**
 * Thrown when the HMAC signature of an incoming webhook does not match the
 * expected value, when the signature header is missing or empty, or when the
 * `Webhooks` handler is instantiated without a non-empty `signingSecret`.
 *
 * Map this to **HTTP 401** at the consumer's HTTP boundary — it signals an
 * **authentication** failure of the webhook request, not a malformed payload.
 *
 * @see WebhookPayloadError for shape / event-type validation failures.
 */
export class WebhookSignatureError extends FamError {
  public override readonly name: string = 'WebhookSignatureError'

  constructor(message = 'Invalid webhook signature') {
    super(message)
  }
}

/**
 * Thrown when the body of an incoming webhook is not valid JSON, is not an
 * object, has an unknown `EventType`, or is missing / has the wrong type for
 * required fields (`RessourceId`, `Date`, `Data`).
 *
 * Map this to **HTTP 400** at the consumer's HTTP boundary — it signals a
 * malformed payload, distinct from an authentication failure.
 *
 * @see WebhookSignatureError for HMAC / authentication failures.
 */
export class WebhookPayloadError extends FamError {
  public override readonly name: string = 'WebhookPayloadError'

  constructor(message = 'Invalid webhook payload') {
    super(message)
  }
}
