/**
 * Base error class for all SDK errors
 */
export class FreelanceAndMeError extends Error {
  public readonly name: string = 'FreelanceAndMeError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * API error with status code and response details
 */
export class ApiError extends FreelanceAndMeError {
  public override readonly name: string = 'ApiError'
  public readonly statusCode: number
  public readonly code?: string
  public readonly details?: unknown

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
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
    super(message, 422, 'VALIDATION_ERROR', errors)
    this.errors = errors
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
  public override readonly name: string = 'RateLimitError'
  public readonly retryAfter?: number

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.retryAfter = retryAfter
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends FreelanceAndMeError {
  public override readonly name: string = 'NetworkError'
  public readonly originalError?: Error

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
 * Webhook signature verification error
 */
export class WebhookSignatureError extends FreelanceAndMeError {
  public override readonly name: string = 'WebhookSignatureError'

  constructor(message = 'Invalid webhook signature') {
    super(message)
  }
}
