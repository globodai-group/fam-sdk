/**
 * Portal module for FAM Payment Portal
 *
 * This module provides methods to create and manage portal sessions
 * that allow users to access the payment portal from client apps.
 *
 * @example
 * ```typescript
 * // Create a portal session for a MangoPay user
 * const session = await client.portal.createSession({
 *   mangopayUserId: 'user_m_01HXK...',
 *   returnUrl: 'https://myapp.com/dashboard',
 * })
 *
 * // Redirect user to portal
 * window.location.href = session.data.url
 * ```
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  GetPortalUserResponse,
  PortalLogoutResponse,
  RefreshPortalSessionResponse,
  ValidatePortalSessionRequest,
  ValidatePortalSessionResponse,
} from '../types/portal.js'

/**
 * Portal API module
 *
 * Provides methods for creating and managing portal sessions.
 * Portal sessions allow users to access the FAM payment portal
 * to manage their subscriptions, cards, and invoices.
 */
export class PortalModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/portal')
  }

  /**
   * Create a new portal session
   *
   * Creates a temporary session that allows the user to access
   * the payment portal. Returns a URL to redirect the user to.
   *
   * @param data - Session creation options
   * @returns Session details including the portal URL
   *
   * @example
   * ```typescript
   * const session = await client.portal.createSession({
   *   mangopayUserId: 'user_m_01HXK...',
   *   returnUrl: 'https://myapp.com/dashboard',
   *   expiresInMinutes: 60,
   * })
   *
   * // Redirect user to portal
   * window.location.href = session.data.url
   * ```
   */
  async createSession(data: CreatePortalSessionRequest): Promise<CreatePortalSessionResponse> {
    return this.post<CreatePortalSessionResponse>('sessions', data)
  }

  /**
   * Validate a portal session token
   *
   * Called by the portal frontend to validate access and get
   * user + website configuration for theming.
   *
   * @param data - Token validation request
   * @returns Session details with user and website config
   *
   * @example
   * ```typescript
   * const result = await client.portal.validateSession({
   *   token: 'session-token-from-url',
   * })
   *
   * if (result.valid) {
   *   const { user, website } = result.data
   *   // Apply website theming and show user info
   * }
   * ```
   */
  async validateSession(
    data: ValidatePortalSessionRequest
  ): Promise<ValidatePortalSessionResponse> {
    return this.post<ValidatePortalSessionResponse>('session/validate', data)
  }

  /**
   * Get current portal user
   *
   * Requires a valid session token in the X-Portal-Session header.
   * This is typically called by the portal frontend after validation.
   *
   * @param sessionToken - The portal session token
   * @returns User information
   *
   * @example
   * ```typescript
   * const user = await client.portal.getUser('session-token')
   * console.log(`Hello ${user.data.firstName}`)
   * ```
   */
  async getUser(sessionToken: string): Promise<GetPortalUserResponse> {
    return this.client.get<GetPortalUserResponse>(this.path('user'), {
      headers: {
        'X-Portal-Session': sessionToken,
      },
    })
  }

  /**
   * Refresh portal session
   *
   * Extends the session expiration by 60 minutes.
   * Requires a valid session token in the X-Portal-Session header.
   *
   * @param sessionToken - The portal session token
   * @returns New expiration datetime
   *
   * @example
   * ```typescript
   * const result = await client.portal.refreshSession('session-token')
   * console.log(`Session extended until ${result.data.expiresAt}`)
   * ```
   */
  async refreshSession(sessionToken: string): Promise<RefreshPortalSessionResponse> {
    return this.client.post<RefreshPortalSessionResponse>(this.path('session/refresh'), undefined, {
      headers: {
        'X-Portal-Session': sessionToken,
      },
    })
  }

  /**
   * Logout and invalidate portal session
   *
   * Invalidates the session token, preventing further access.
   *
   * @param sessionToken - The portal session token
   * @returns Logout confirmation
   *
   * @example
   * ```typescript
   * await client.portal.logout('session-token')
   * // Redirect to return URL or home
   * ```
   */
  async logout(sessionToken: string): Promise<PortalLogoutResponse> {
    return this.client.post<PortalLogoutResponse>(this.path('logout'), undefined, {
      headers: {
        'X-Portal-Session': sessionToken,
      },
    })
  }
}
