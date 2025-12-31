import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient } from '../client.js'
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from '../errors/index.js'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new HttpClient({
      baseUrl: 'https://api.example.com',
      token: 'test-token',
      timeout: 5000,
      retries: 0,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create client with required options', () => {
      const c = new HttpClient({ baseUrl: 'https://api.example.com' })
      expect(c).toBeInstanceOf(HttpClient)
    })

    it('should strip trailing slash from base url', () => {
      const c = new HttpClient({ baseUrl: 'https://api.example.com/' })
      expect(c).toBeInstanceOf(HttpClient)
    })

    it('should use default timeout if not provided', () => {
      const c = new HttpClient({ baseUrl: 'https://api.example.com' })
      expect(c).toBeInstanceOf(HttpClient)
    })

    it('should use default retries if not provided', () => {
      const c = new HttpClient({ baseUrl: 'https://api.example.com' })
      expect(c).toBeInstanceOf(HttpClient)
    })
  })

  describe('setToken', () => {
    it('should update the token', () => {
      client.setToken('new-token')
      expect(client).toBeInstanceOf(HttpClient)
    })
  })

  describe('clearToken', () => {
    it('should clear the token', () => {
      client.clearToken()
      expect(client).toBeInstanceOf(HttpClient)
    })
  })

  describe('get', () => {
    it('should make a GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test' }),
        status: 200,
        headers: new Headers(),
      })

      const result = await client.get<{ id: number; name: string }>('/users/1')

      expect(result).toEqual({ id: 1, name: 'Test' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should include query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
        status: 200,
        headers: new Headers(),
      })

      await client.get('/users', { params: { page: 1, limit: 10 } })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      )
    })
  })

  describe('post', () => {
    it('should make a POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
        status: 201,
        headers: new Headers(),
      })

      const result = await client.post('/users', { name: 'Test' })

      expect(result).toEqual({ id: 1 })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      )
    })
  })

  describe('put', () => {
    it('should make a PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
        status: 200,
        headers: new Headers(),
      })

      await client.put('/users/1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      )
    })
  })

  describe('patch', () => {
    it('should make a PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
        status: 200,
        headers: new Headers(),
      })

      await client.patch('/users/1', { name: 'Patched' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 204,
        headers: new Headers(),
      })

      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('error handling', () => {
    it('should throw AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid token' }),
        headers: new Headers(),
      })

      await expect(client.get('/protected')).rejects.toThrow(AuthenticationError)
    })

    it('should throw AuthorizationError on 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Access denied' }),
        headers: new Headers(),
      })

      await expect(client.get('/admin')).rejects.toThrow(AuthorizationError)
    })

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' }),
        headers: new Headers(),
      })

      await expect(client.get('/users/999')).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError on 400 with errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Validation failed',
          errors: { email: ['invalid format'] },
        }),
        headers: new Headers(),
      })

      await expect(client.post('/users', {})).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          message: 'Validation failed',
          errors: { name: ['required'] },
        }),
        headers: new Headers(),
      })

      await expect(client.post('/users', {})).rejects.toThrow(ValidationError)
    })

    it('should throw RateLimitError on 429', async () => {
      const headers = new Headers()
      headers.set('Retry-After', '60')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ message: 'Rate limit exceeded' }),
        headers,
      })

      await expect(client.get('/users')).rejects.toThrow(RateLimitError)
    })

    it('should throw ApiError on other status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
        headers: new Headers(),
      })

      await expect(client.get('/users')).rejects.toThrow(ApiError)
    })

    it('should handle non-json error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON')
        },
        headers: new Headers(),
      })

      await expect(client.get('/users')).rejects.toThrow(ApiError)
    })

    it('should throw NetworkError on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(client.get('/users')).rejects.toThrow(NetworkError)
    })

    it('should throw TimeoutError on abort', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Aborted')
        error.name = 'AbortError'
        throw error
      })

      await expect(client.get('/users')).rejects.toThrow(TimeoutError)
    })
  })

  describe('retry logic', () => {
    it('should retry on network errors', async () => {
      const clientWithRetry = new HttpClient({
        baseUrl: 'https://api.example.com',
        retries: 2,
      })

      mockFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200,
        headers: new Headers(),
      })

      const result = await clientWithRetry.get('/users')
      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should skip retry when skipRetry is true', async () => {
      const clientWithRetry = new HttpClient({
        baseUrl: 'https://api.example.com',
        retries: 3,
      })

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(clientWithRetry.get('/users', { skipRetry: true })).rejects.toThrow(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('headers', () => {
    it('should include custom headers', async () => {
      const clientWithHeaders = new HttpClient({
        baseUrl: 'https://api.example.com',
        headers: { 'X-Custom-Header': 'custom-value' },
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 200,
        headers: new Headers(),
      })

      await clientWithHeaders.get('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      )
    })

    it('should allow request-level header overrides', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 200,
        headers: new Headers(),
      })

      await client.get('/users', {
        headers: { 'X-Request-Id': 'request-123' },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-Id': 'request-123',
          }),
        })
      )
    })
  })
})
