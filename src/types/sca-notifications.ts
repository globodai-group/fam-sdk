/**
 * Types for the FAM Portal SCA notification endpoints.
 *
 * See `ScaNotificationsModule` for usage. Distinct from
 * `ScaPendingNotification` in `./portal.ts` which is the shape returned
 * by the *portal-session-authenticated* listing endpoint
 * (`GET /portal/sca/pending`). These types here describe the *token-gated*
 * capability endpoints (`/sca-notifications/:token/...`).
 */

/**
 * Metadata returned by `GET /sca/sca-notifications/:token`.
 *
 * The endpoint also surfaces a flat `website` block (id, name, logoUrl,
 * supportEmail) so consumers can render a branded validation page
 * without an extra round-trip.
 */
export interface ScaNotificationData {
  notificationToken: string
  action: string
  amount: number | null
  mangopayUserId: string
  sentAt: string
  expiresAt: string
  validatedAt: string | null
  expired: boolean
  website: {
    id: string
    name: string | null
    logoUrl: string | null
    supportEmail: string | null
  }
}

export type GetScaNotificationResponse = ScaNotificationData

export interface CreateScaRedirectInput {
  /**
   * Mangopay environment hint ('prod' / 'staging'). FAM falls back to the
   * notification's stored env when not provided.
   */
  mangopayEnv?: string | null
  /**
   * Resource ID required to replay the original failing call (e.g. wallet
   * ID for `wallet_read`, transfer ID for `transfer`, payout ID for
   * `payout`). Optional for `user_read`.
   */
  resourceId?: string | null
  /**
   * HTTPS URL where Mangopay will redirect the user after they validate
   * the 3DS challenge. Must prefix-match one of the entries in the
   * calling website's `allowed_return_urls` whitelist server-side.
   *
   * When omitted, FAM falls back to `${PORTAL_BASE_URL}/sca-done?notif=...`.
   */
  returnUrl?: string | null
}

export interface CreateScaRedirectResponse {
  redirectUrl: string
}

export interface ValidateScaResponse {
  validated: boolean
  validatedAt: string | null
}
