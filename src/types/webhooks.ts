/**
 * Webhook types for the SDK
 */

/**
 * Mangopay event types — values list (frozen) used for runtime validation
 */
export const MANGOPAY_EVENT_TYPES = [
  'PAYIN_NORMAL_CREATED',
  'PAYIN_NORMAL_SUCCEEDED',
  'PAYIN_NORMAL_FAILED',
  'PAYIN_REFUND_CREATED',
  'PAYIN_REFUND_SUCCEEDED',
  'PAYIN_REFUND_FAILED',
  'PAYOUT_NORMAL_CREATED',
  'PAYOUT_NORMAL_SUCCEEDED',
  'PAYOUT_NORMAL_FAILED',
  'PAYOUT_REFUND_CREATED',
  'PAYOUT_REFUND_SUCCEEDED',
  'PAYOUT_REFUND_FAILED',
  'TRANSFER_NORMAL_CREATED',
  'TRANSFER_NORMAL_SUCCEEDED',
  'TRANSFER_NORMAL_FAILED',
  'TRANSFER_REFUND_CREATED',
  'TRANSFER_REFUND_SUCCEEDED',
  'TRANSFER_REFUND_FAILED',
  'KYC_CREATED',
  'KYC_VALIDATION_ASKED',
  'KYC_SUCCEEDED',
  'KYC_FAILED',
  'KYC_OUTDATED',
  'UBO_DECLARATION_CREATED',
  'UBO_DECLARATION_VALIDATION_ASKED',
  'UBO_DECLARATION_VALIDATED',
  'UBO_DECLARATION_REFUSED',
  'UBO_DECLARATION_INCOMPLETE',
  'PREAUTHORIZATION_CREATED',
  'PREAUTHORIZATION_SUCCEEDED',
  'PREAUTHORIZATION_FAILED',
  'CARD_VALIDATION_CREATED',
  'CARD_VALIDATION_SUCCEEDED',
  'CARD_VALIDATION_FAILED',
  'USER_KYC_REGULAR',
  'USER_KYC_LIGHT',
  'USER_INFLOWS_BLOCKED',
  'USER_INFLOWS_UNBLOCKED',
  'USER_OUTFLOWS_BLOCKED',
  'USER_OUTFLOWS_UNBLOCKED',
  'RECURRING_REGISTRATION_CREATED',
  'RECURRING_REGISTRATION_AUTH_NEEDED',
  'RECURRING_REGISTRATION_IN_PROGRESS',
  'RECURRING_REGISTRATION_ENDED',
] as const

/**
 * FAM custom event type values (frozen) used for runtime validation
 */
export const FAM_EVENT_TYPES = [
  'FAM_SUBSCRIPTION_CREATED',
  'FAM_SUBSCRIPTION_UPDATED',
  'FAM_SUBSCRIPTION_CANCELLED',
  'FAM_SUBSCRIPTION_PAYMENT_SCHEDULED',
  'FAM_SUBSCRIPTION_PAYMENT_SUCCEEDED',
  'FAM_SUBSCRIPTION_PAYMENT_FAILED',
] as const

/**
 * Union of all known webhook event type values
 */
export const KNOWN_WEBHOOK_EVENT_TYPES = [...MANGOPAY_EVENT_TYPES, ...FAM_EVENT_TYPES] as const

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
 * Base webhook event.
 *
 * Note on `RessourceId`: the upstream Mangopay payload misspells `ResourceId`
 * with a double `s`. The SDK preserves the misspelling on the wire so that
 * existing consumer code keeps working, but you can also access the same
 * value via the {@link ResourceId} accessor type — see `ResourceId` below.
 */
export interface BaseWebhookEvent {
  EventType: WebhookEventType
  /**
   * The Mangopay resource identifier the event refers to. Spelled
   * `RessourceId` (double `s`) on the wire, mirroring the Mangopay payload.
   * Prefer the {@link ResourceId} alias in new consumer code.
   */
  RessourceId: string
  Date: number
}

/**
 * Read-only accessor type for the resource id of a {@link BaseWebhookEvent}.
 *
 * Lets consumer code spell the field correctly:
 *
 * ```ts
 * const id: ResourceId<typeof event> = event.RessourceId
 * ```
 *
 * No runtime cost — this is purely a type alias mapping the misspelled
 * `RessourceId` field. The wire format remains `RessourceId` because that
 * is what Mangopay sends; this alias only exists for ergonomic access.
 */
export type ResourceId<T extends BaseWebhookEvent = BaseWebhookEvent> = T['RessourceId']

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
 * Webhook handler configuration.
 */
export interface WebhookHandlerConfig {
  /**
   * HMAC SHA-256 secret used to verify incoming webhook signatures.
   * Provided per environment by the FAM admin at site ID creation
   * (see FAM_WEBHOOK_SIGNING_SECRET in the SDK README).
   * Required: instantiating Webhooks without it throws.
   */
  signingSecret: string
  /**
   * Maximum tolerated drift, in **seconds**, between the timestamp embedded
   * in a Stripe-style signed signature header and the local clock when
   * calling {@link Webhooks.verifySigned} or
   * {@link Webhooks.constructEventSigned}.
   *
   * A signature whose timestamp falls outside `[now - tolerance, now + tolerance]`
   * is rejected as a replay candidate, even if the HMAC is valid.
   *
   * Default: `300` (5 minutes), matching the de-facto industry standard
   * (Stripe). Has no effect on the legacy {@link Webhooks.verify} or
   * {@link Webhooks.constructEvent} which do not consume a timestamp.
   *
   * @default 300
   */
  timestampTolerance?: number
}
