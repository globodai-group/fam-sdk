/**
 * Base module for API modules
 */

import type { HttpClient, RequestOptions } from '../client.js'

/**
 * Base class for all API modules
 */
export abstract class BaseModule {
  protected readonly client: HttpClient
  protected readonly basePath: string

  constructor(client: HttpClient, basePath: string) {
    this.client = client
    this.basePath = basePath
  }

  /**
   * Build the full path for an endpoint
   */
  protected path(segments: string | string[] = ''): string {
    if (Array.isArray(segments)) {
      return `${this.basePath}/${segments.join('/')}`
    }
    return segments.length > 0 ? `${this.basePath}/${segments}` : this.basePath
  }

  /**
   * Make a GET request
   */
  protected async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.client.get<T>(this.path(endpoint), options)
  }

  /**
   * Make a POST request
   */
  protected async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.client.post<T>(this.path(endpoint), body, options)
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.client.put<T>(this.path(endpoint), body, options)
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.client.patch<T>(this.path(endpoint), body, options)
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.client.delete<T>(this.path(endpoint), options)
  }
}
