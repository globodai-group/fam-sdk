/**
 * Webhook types for the SDK
 */

/**
 * Mangopay event types
 */
export type MangopayEventType =
  // PayIn events
  | 'PAYIN_NORMAL_CREATED'
  | 'PAYIN_NORMAL_SUCCEEDED'
  | 'PAYIN_NORMAL_FAILED'
  | 'PAYIN_REFUND_CREATED'
  | 'PAYIN_REFUND_SUCCEEDED'
  | 'PAYIN_REFUND_FAILED'
  // PayOut events
  | 'PAYOUT_NORMAL_CREATED'
  | 'PAYOUT_NORMAL_SUCCEEDED'
  | 'PAYOUT_NORMAL_FAILED'
  | 'PAYOUT_REFUND_CREATED'
  | 'PAYOUT_REFUND_SUCCEEDED'
  | 'PAYOUT_REFUND_FAILED'
  // Transfer events
  | 'TRANSFER_NORMAL_CREATED'
  | 'TRANSFER_NORMAL_SUCCEEDED'
  | 'TRANSFER_NORMAL_FAILED'
  | 'TRANSFER_REFUND_CREATED'
  | 'TRANSFER_REFUND_SUCCEEDED'
  | 'TRANSFER_REFUND_FAILED'
  // KYC events
  | 'KYC_CREATED'
  | 'KYC_VALIDATION_ASKED'
  | 'KYC_SUCCEEDED'
  | 'KYC_FAILED'
  | 'KYC_OUTDATED'
  // UBO events
  | 'UBO_DECLARATION_CREATED'
  | 'UBO_DECLARATION_VALIDATION_ASKED'
  | 'UBO_DECLARATION_VALIDATED'
  | 'UBO_DECLARATION_REFUSED'
  | 'UBO_DECLARATION_INCOMPLETE'
  // Card events
  | 'PREAUTHORIZATION_CREATED'
  | 'PREAUTHORIZATION_SUCCEEDED'
  | 'PREAUTHORIZATION_FAILED'
  | 'CARD_VALIDATION_CREATED'
  | 'CARD_VALIDATION_SUCCEEDED'
  | 'CARD_VALIDATION_FAILED'
  // User events
  | 'USER_KYC_REGULAR'
  | 'USER_KYC_LIGHT'
  | 'USER_INFLOWS_BLOCKED'
  | 'USER_INFLOWS_UNBLOCKED'
  | 'USER_OUTFLOWS_BLOCKED'
  | 'USER_OUTFLOWS_UNBLOCKED'
  // Recurring events
  | 'RECURRING_REGISTRATION_CREATED'
  | 'RECURRING_REGISTRATION_AUTH_NEEDED'
  | 'RECURRING_REGISTRATION_IN_PROGRESS'
  | 'RECURRING_REGISTRATION_ENDED'

/**
 * FAM custom event types
 */
export type FamEventType =
  | 'FAM_SUBSCRIPTION_CREATED'
  | 'FAM_SUBSCRIPTION_UPDATED'
  | 'FAM_SUBSCRIPTION_CANCELLED'
  | 'FAM_SUBSCRIPTION_PAYMENT_SCHEDULED'
  | 'FAM_SUBSCRIPTION_PAYMENT_SUCCEEDED'
  | 'FAM_SUBSCRIPTION_PAYMENT_FAILED'

/**
 * All event types
 */
export type WebhookEventType = MangopayEventType | FamEventType

/**
 * Base webhook event
 */
export interface BaseWebhookEvent {
  EventType: WebhookEventType
  RessourceId: string
  Date: number
}

/**
 * Mangopay webhook event
 */
export interface MangopayWebhookEvent extends BaseWebhookEvent {
  EventType: MangopayEventType
}

/**
 * FAM webhook event
 */
export interface FamWebhookEvent extends BaseWebhookEvent {
  EventType: FamEventType
  Data?: Record<string, unknown>
}

/**
 * Webhook event union
 */
export type WebhookEvent = MangopayWebhookEvent | FamWebhookEvent

/**
 * Webhook handler configuration
 */
export interface WebhookHandlerConfig {
  /** Secret key for signature verification */
  signingSecret?: string
  /** Tolerance for timestamp validation in seconds */
  timestampTolerance?: number
}
