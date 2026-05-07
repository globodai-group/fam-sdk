/**
 * IDV (Identity Verification) Sessions — Mangopay hosted KYC flow
 *
 * Mangopay creates a hosted page where the end-user submits an ID
 * document; the platform receives the outcome via `IDV_SESSION_*`
 * webhooks. There is no GET endpoint — state is delivered exclusively
 * through webhooks.
 *
 * Reference: https://docs.mangopay.com/api-reference/idv-sessions
 */

/**
 * Lifecycle of an IDV session.
 *
 * - `PENDING`     — created, awaiting user submission
 * - `REVIEW`      — under manual review by Mangopay
 * - `VALIDATED`   — user identity verified
 * - `REFUSED`     — verification failed
 * - `OUT_OF_DATE` — previously validated, downgraded
 */
export type IdvSessionStatus = 'PENDING' | 'REVIEW' | 'VALIDATED' | 'REFUSED' | 'OUT_OF_DATE'

export type IdvCheckType =
  | 'IDENTITY_DOCUMENT_VERIFICATION'
  | 'IDV_AGE_CHECK'
  | 'BUSINESS_VERIFICATION'
  | 'IDV_NAME_MATCH_CHECK'
  | 'BUSINESS_NAME_MATCH'
  | 'BUSINESS_INSIGHTS_MATCH'

export type IdvCheckStatus = 'VALIDATED' | 'REFUSED'

export interface IdvCheck {
  CheckId: string
  Type: IdvCheckType
  CheckStatus: IdvCheckStatus
  Data?: Record<string, string | null>
}

/**
 * Payload to start a Mangopay-hosted IDV session.
 */
export interface CreateIdvSessionRequest {
  /** Where Mangopay sends the user back after the hosted flow (max 50 chars). */
  ReturnUrl: string
  /** Custom metadata (max 255 chars). */
  Tag?: string
}

export interface IdvSession {
  Id: string
  UserId: string
  Status: IdvSessionStatus
  HostedUrl: string
  ReturnUrl: string
  Tag: string | null
  CreationDate: number
  LastUpdate: number
  Checks?: IdvCheck[]
}
