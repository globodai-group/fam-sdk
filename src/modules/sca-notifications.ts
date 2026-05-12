/**
 * SCA Notifications module for the token-gated SCA validation flow.
 *
 * Each Mangopay SCA challenge captured by FAM produces a
 * `MangopayScaNotification` row with a stable `notificationToken` (UUID)
 * that acts as a capability — no portal session required, the token IS
 * the auth. Use these endpoints to render your own validation UX:
 *
 *   - `show(token)`       — fetch metadata for the validation page
 *   - `redirect(token)`   — generate a fresh Mangopay redirect URL on click
 *   - `validated(token)`  — mark the notification as completed after the
 *                           user comes back from Mangopay's 3DS page
 *
 * @example
 * ```typescript
 * // 1. User clicks the magic-link in their email → your page fetches metadata
 * const { sentAt, action, amount } = (await client.scaNotifications.show(token)).data
 *
 * // 2. User clicks "Valider" → generate fresh Mangopay URL with returnUrl
 * const { redirectUrl } = (await client.scaNotifications.redirect(token, {
 *   returnUrl: 'https://yourapp.com/sca/done?notif=' + token,
 * })).data
 * window.location.href = redirectUrl
 *
 * // 3. Mangopay redirects back → you POST validated
 * await client.scaNotifications.validated(token)
 * ```
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  CreateScaRedirectInput,
  CreateScaRedirectResponse,
  GetScaNotificationResponse,
  ValidateScaResponse,
} from '../types/sca-notifications.js'

export class ScaNotificationsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/sca/sca-notifications')
  }

  /**
   * Fetch the metadata for an SCA notification by its token.
   *
   * Anyone holding the token can call this — typically your validation
   * page on page load. Returns 404 when the token is unknown.
   *
   * @param notificationToken - The stable notification token (UUID)
   */
  async show(notificationToken: string): Promise<GetScaNotificationResponse> {
    return this.get<GetScaNotificationResponse>(notificationToken)
  }

  /**
   * Generate a fresh Mangopay redirect URL for the SCA challenge.
   *
   * FAM replays the original failing Mangopay call to obtain a fresh
   * `RedirectUrl` (the short-lived ones expire fast), then appends
   * `&returnUrl=...` so Mangopay redirects the user back after the
   * 3DS validation succeeds.
   *
   * Pass `returnUrl` to override the default
   * `${PORTAL_BASE_URL}/sca-done?notif=...`. The URL must be HTTPS and
   * must match (prefix) one of the values in the calling website's
   * `allowed_return_urls` whitelist server-side, otherwise 400.
   *
   * Returns 409 when the notification is already validated, 410 when
   * it's expired, 502 when the Mangopay replay fails to produce a
   * fresh PendingUserAction.
   *
   * @param notificationToken - The stable notification token (UUID)
   * @param input - Optional overrides (Mangopay env, resource ID, returnUrl)
   */
  async redirect(
    notificationToken: string,
    input: CreateScaRedirectInput = {}
  ): Promise<CreateScaRedirectResponse> {
    const base = {
      mangopayEnv: input.mangopayEnv ?? null,
      resourceId: input.resourceId ?? null,
    }
    const body =
      input.returnUrl !== undefined && input.returnUrl !== null
        ? { ...base, returnUrl: input.returnUrl }
        : base
    return this.post<CreateScaRedirectResponse>(`${notificationToken}/redirect`, body)
  }

  /**
   * Mark the SCA notification as validated.
   *
   * Call this from your "/sca/done" landing page after Mangopay has
   * redirected the user back. Idempotent server-side (second call is a
   * no-op, no duplicate webhook). Triggers the `sca.validated` webhook
   * back to your website's configured webhookUrl.
   *
   * @param notificationToken - The stable notification token (UUID)
   */
  async validated(notificationToken: string): Promise<ValidateScaResponse> {
    return this.post<ValidateScaResponse>(`${notificationToken}/validated`)
  }
}
