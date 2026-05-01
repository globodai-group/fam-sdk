/**
 * Webhooks handler for Mangopay and FAM events
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { WebhookPayloadError, WebhookSignatureError } from '../errors/index.js'
import {
  KNOWN_WEBHOOK_EVENT_TYPES,
  type FamEventType,
  type MangopayEventType,
  type WebhookEvent,
  type WebhookEventType,
  type WebhookHandlerConfig,
} from '../types/webhooks.js'

function isKnownEventType(value: unknown): value is WebhookEventType {
  return (
    typeof value === 'string' && (KNOWN_WEBHOOK_EVENT_TYPES as readonly string[]).includes(value)
  )
}

function assertWebhookEvent(candidate: unknown): WebhookEvent {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    throw new WebhookPayloadError('Invalid webhook payload: expected a JSON object')
  }

  const obj = candidate as Record<string, unknown>

  if (!isKnownEventType(obj['EventType'])) {
    throw new WebhookPayloadError(
      `Invalid webhook payload: unknown or missing EventType (got ${String(obj['EventType'])})`
    )
  }

  if (typeof obj['RessourceId'] !== 'string' || obj['RessourceId'].length === 0) {
    throw new WebhookPayloadError('Invalid webhook payload: RessourceId must be a non-empty string')
  }

  if (typeof obj['Date'] !== 'number' || !Number.isFinite(obj['Date'])) {
    throw new WebhookPayloadError('Invalid webhook payload: Date must be a finite number')
  }

  if (
    obj['EventType'].startsWith('FAM_') &&
    obj['Data'] !== undefined &&
    (typeof obj['Data'] !== 'object' || obj['Data'] === null || Array.isArray(obj['Data']))
  ) {
    throw new WebhookPayloadError('Invalid webhook payload: Data must be an object when present')
  }

  return obj as unknown as WebhookEvent
}

/**
 * Check if event is a Mangopay event
 */
export function isMangopayEvent(eventType: string): eventType is MangopayEventType {
  return !eventType.startsWith('FAM_')
}

/**
 * Check if event is a FAM custom event
 */
export function isFamEvent(eventType: string): eventType is FamEventType {
  return eventType.startsWith('FAM_')
}

/**
 * Webhooks handler class
 */
export class Webhooks {
  private readonly signingSecret: string

  /**
   * Build a webhook handler bound to a specific HMAC SHA-256 signing secret.
   *
   * @param config Handler configuration. `signingSecret` must be non-empty;
   *   provide `FAM_WEBHOOK_SIGNING_SECRET` from the FAM admin per environment.
   * @throws {WebhookSignatureError} If `signingSecret` is missing or empty —
   *   instantiating without a secret is treated as an authentication
   *   misconfiguration, not a runtime payload error.
   */
  constructor(config: WebhookHandlerConfig) {
    // Runtime guard: protects JS consumers (no compile-time types) from
    // instantiating an unconfigured handler. The TS compiler already enforces
    // signingSecret as required, hence the disable.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (config.signingSecret === undefined || config.signingSecret.length === 0) {
      throw new WebhookSignatureError(
        'Webhooks handler requires a non-empty signingSecret. Provide FAM_WEBHOOK_SIGNING_SECRET from the FAM admin (per environment).'
      )
    }
    this.signingSecret = config.signingSecret
  }

  /**
   * Verify the HMAC SHA-256 signature of a raw webhook payload.
   *
   * Returns `true` only if the supplied `signature` matches the HMAC
   * computed from the raw payload and the configured signing secret, using
   * a constant-time comparison.
   *
   * @returns `true` if the signature is valid, `false` if it is well-formed
   *   but does not match.
   * @throws {WebhookSignatureError} If `signature` is `undefined` or empty —
   *   a missing signature is treated as an authentication failure.
   */
  verify(payload: string, signature: string | undefined): boolean {
    if (signature === undefined || signature.length === 0) {
      throw new WebhookSignatureError('Missing webhook signature')
    }

    const expectedSignature = this.computeSignature(payload)
    return this.secureCompare(signature, expectedSignature)
  }

  /**
   * Parse a webhook payload into a typed `WebhookEvent`.
   *
   * Accepts either a JSON string (parsed internally) or an already-decoded
   * object. The result is validated against the known set of event types and
   * required fields. **No signature verification is performed here** — call
   * {@link Webhooks.verify} or {@link Webhooks.constructEvent} for that.
   *
   * @throws {WebhookPayloadError} If the payload is not valid JSON, is not an
   *   object, has an unknown `EventType`, has missing or wrongly-typed
   *   required fields, or (for FAM events) has a non-object `Data` field.
   */
  parse(payload: unknown): WebhookEvent {
    let candidate: unknown

    if (typeof payload === 'string') {
      try {
        candidate = JSON.parse(payload)
      } catch {
        throw new WebhookPayloadError('Invalid webhook payload: not valid JSON')
      }
    } else if (typeof payload === 'object' && payload !== null) {
      candidate = payload
    } else {
      throw new WebhookPayloadError('Invalid webhook payload: expected object or JSON string')
    }

    return assertWebhookEvent(candidate)
  }

  /**
   * Verify the signature **and** validate the payload of a webhook in a
   * single call. The recommended entry-point for HTTP webhook handlers.
   *
   * Internally calls {@link Webhooks.verify} then {@link Webhooks.parse}.
   * The two distinct error classes thrown allow consumers to map to HTTP
   * status codes without inspecting messages:
   *
   * | Thrown class            | Meaning            | Suggested HTTP status |
   * | ----------------------- | ------------------ | --------------------- |
   * | `WebhookSignatureError` | Auth failure       | `401`                 |
   * | `WebhookPayloadError`   | Malformed payload  | `400`                 |
   *
   * @throws {WebhookSignatureError} If the signature is missing or invalid.
   * @throws {WebhookPayloadError}   If the payload is not valid JSON, is not
   *   an object, has an unknown `EventType`, or has missing/wrongly-typed
   *   required fields.
   */
  constructEvent(payload: string, signature: string | undefined): WebhookEvent {
    if (!this.verify(payload, signature)) {
      throw new WebhookSignatureError('Invalid webhook signature')
    }
    return this.parse(payload)
  }

  /**
   * Type guard for a specific event type. Useful in narrowing branches of
   * an event handler.
   */
  isEventType(event: WebhookEvent, eventType: WebhookEvent['EventType']): boolean {
    return event.EventType === eventType
  }

  /**
   * Compute HMAC signature
   */
  private computeSignature(payload: string): string {
    const hmac = createHmac('sha256', this.signingSecret)
    hmac.update(payload)
    return hmac.digest('hex')
  }

  /**
   * Timing-safe string comparison
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    const bufferA = Buffer.from(a)
    const bufferB = Buffer.from(b)

    return timingSafeEqual(bufferA, bufferB)
  }
}

// Re-export the error classes consumers need to discriminate auth vs
// validation failures when calling Webhooks methods. Re-exporting from the
// subpath lets consumers write `import { Webhooks, WebhookSignatureError }
// from 'globodai-fam-sdk/webhooks'` without a second import line, and
// guarantees the same runtime class identity as the root entry-point.
export { WebhookPayloadError, WebhookSignatureError } from '../errors/index.js'

// Re-export types for convenience
export type {
  BaseWebhookEvent,
  FamEventType,
  FamWebhookEvent,
  MangopayEventType,
  MangopayWebhookEvent,
  WebhookEvent,
  WebhookEventType,
  WebhookHandlerConfig,
} from '../types/webhooks.js'
