import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from './errors/index.js'
import { buildUrl, retry } from './utils/index.js'

/**
 * SDK configuration options
 */
export interface FreelanceAndMeOptions {
  /** Base URL of the API */
  baseUrl: string
  /** Authentication token */
  token?: string
  /** Request timeout in milliseconds */
  timeout?: number
  /** Number of retries on network errors */
  retries?: number
  /** Custom headers to include in all requests */
  headers?: Record<string, string>
}

/**
 * Request options for individual API calls
 */
export interface RequestOptions {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined | null>
  /** Request headers */
  headers?: Record<string, string>
  /** Request timeout override */
  timeout?: number
  /** Skip retry logic */
  skipRetry?: boolean
}

/**
 * API response structure
 */
interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

/**
 * Error response from the API
 */
interface ErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]>
  code?: string
}

/**
 * HTTP client for making API requests
 */
export class HttpClient {
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly retries: number
  private readonly defaultHeaders: Record<string, string>
  private token: string | undefined

  constructor(options: FreelanceAndMeOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.token = options.token
    this.timeout = options.timeout ?? 30000
    this.retries = options.retries ?? 3
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    }
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = undefined
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options)
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options)
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options)
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options)
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options)
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildUrl(this.baseUrl, path, options?.params)
    const timeout = options?.timeout ?? this.timeout
    const headers = this.buildHeaders(options?.headers)

    const makeRequest = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, timeout)

      try {
        const fetchOptions: RequestInit = {
          method,
          headers,
          signal: controller.signal,
        }

        if (body !== undefined) {
          fetchOptions.body = JSON.stringify(body)
        }

        const response = await fetch(url, fetchOptions)

        clearTimeout(timeoutId)

        if (!response.ok) {
          await this.handleErrorResponse(response)
        }

        const data = (await response.json()) as T

        return {
          data,
          status: response.status,
          headers: response.headers,
        }
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError(`Request timeout after ${String(timeout)}ms`)
        }

        if (error instanceof ApiError) {
          throw error
        }

        throw new NetworkError(
          error instanceof Error ? error.message : 'Network request failed',
          error instanceof Error ? error : undefined
        )
      }
    }

    if (options?.skipRetry === true) {
      const response = await makeRequest()
      return response.data
    }

    const response = await retry(makeRequest, {
      maxRetries: this.retries,
      shouldRetry: (error): boolean => {
        if (error instanceof NetworkError || error instanceof TimeoutError) {
          return true
        }
        if (error instanceof RateLimitError) {
          return true
        }
        if (error instanceof ApiError && error.statusCode >= 500) {
          return true
        }
        return false
      },
    })

    return response.data
  }

  /**
   * Build request headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders }

    if (this.token !== undefined) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    if (customHeaders !== undefined) {
      Object.assign(headers, customHeaders)
    }

    return headers
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse = {}

    try {
      errorData = (await response.json()) as ErrorResponse
    } catch {
      // Response body is not JSON
    }

    const message = errorData.message ?? errorData.error ?? response.statusText
    const code = errorData.code

    switch (response.status) {
      case 400:
        if (errorData.errors !== undefined) {
          throw new ValidationError(message, errorData.errors)
        }
        throw new ApiError(message, 400, code, errorData)

      case 401:
        throw new AuthenticationError(message)

      case 403:
        throw new AuthorizationError(message)

      case 404:
        throw new NotFoundError(message)

      case 422:
        throw new ValidationError(message, errorData.errors ?? {})

      case 429: {
        const retryAfter = response.headers.get('Retry-After')
        throw new RateLimitError(
          message,
          retryAfter !== null ? parseInt(retryAfter, 10) : undefined
        )
      }

      default:
        throw new ApiError(message, response.status, code, errorData)
    }
  }
}
