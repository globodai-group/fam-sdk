import { describe, expect, it } from 'vitest'
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  FamError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
  WebhookSignatureError,
} from '../errors/index.js'

describe('FamError', () => {
  it('should create a base error with message', () => {
    const error = new FamError('test message')
    expect(error.message).toBe('test message')
    expect(error.name).toBe('FamError')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('ApiError', () => {
  it('should create an api error with status code', () => {
    const error = new ApiError('api error', 500)
    expect(error.message).toBe('api error')
    expect(error.statusCode).toBe(500)
    expect(error.name).toBe('ApiError')
  })

  it('should create an api error with code and details', () => {
    const error = new ApiError('api error', 400, 'INVALID_REQUEST', { field: 'email' })
    expect(error.code).toBe('INVALID_REQUEST')
    expect(error.details).toEqual({ field: 'email' })
  })

  it('should handle undefined code and details', () => {
    const error = new ApiError('api error', 500)
    expect(error.code).toBeUndefined()
    expect(error.details).toBeUndefined()
  })
})

describe('AuthenticationError', () => {
  it('should create an authentication error', () => {
    const error = new AuthenticationError('invalid token')
    expect(error.message).toBe('invalid token')
    expect(error.statusCode).toBe(401)
    expect(error.name).toBe('AuthenticationError')
  })
})

describe('AuthorizationError', () => {
  it('should create an authorization error', () => {
    const error = new AuthorizationError('forbidden')
    expect(error.message).toBe('forbidden')
    expect(error.statusCode).toBe(403)
    expect(error.name).toBe('AuthorizationError')
  })
})

describe('NotFoundError', () => {
  it('should create a not found error', () => {
    const error = new NotFoundError('resource not found')
    expect(error.message).toBe('resource not found')
    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('NotFoundError')
  })
})

describe('ValidationError', () => {
  it('should create a validation error with errors object', () => {
    const errors = { email: ['invalid format'], password: ['too short'] }
    const error = new ValidationError('validation failed', errors)
    expect(error.message).toBe('validation failed')
    expect(error.statusCode).toBe(422)
    expect(error.errors).toEqual(errors)
    expect(error.name).toBe('ValidationError')
  })
})

describe('RateLimitError', () => {
  it('should create a rate limit error with retry after', () => {
    const error = new RateLimitError('too many requests', 60)
    expect(error.message).toBe('too many requests')
    expect(error.statusCode).toBe(429)
    expect(error.retryAfter).toBe(60)
    expect(error.name).toBe('RateLimitError')
  })

  it('should handle undefined retry after', () => {
    const error = new RateLimitError('too many requests')
    expect(error.retryAfter).toBeUndefined()
  })
})

describe('TimeoutError', () => {
  it('should create a timeout error', () => {
    const error = new TimeoutError('request timed out')
    expect(error.message).toBe('request timed out')
    expect(error.name).toBe('TimeoutError')
  })
})

describe('NetworkError', () => {
  it('should create a network error with original error', () => {
    const original = new Error('connection refused')
    const error = new NetworkError('network error', original)
    expect(error.message).toBe('network error')
    expect(error.originalError).toBe(original)
    expect(error.name).toBe('NetworkError')
  })

  it('should handle undefined original error', () => {
    const error = new NetworkError('network error')
    expect(error.originalError).toBeUndefined()
  })
})

describe('WebhookSignatureError', () => {
  it('should create a webhook signature error', () => {
    const error = new WebhookSignatureError('invalid signature')
    expect(error.message).toBe('invalid signature')
    expect(error.name).toBe('WebhookSignatureError')
  })
})
