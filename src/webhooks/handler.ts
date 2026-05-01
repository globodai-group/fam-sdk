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

/** Default tolerance window (in seconds) for signed-timestamp replay protection. */
const DEFAULT_TIMESTAMP_TOLERANCE_SECONDS = 300

/**
 * Parse a Stripe-style signed header, e.g. `t=1714579200,v1=2a8c...e3b9`.
 * Throws if the header is malformed, the timestamp is missing/unparseable,
 * or the `v1` signature scheme is missing. Extra schemes (e.g. `v0`, `v2`)
 * are tolerated and ignored to allow forward-compatibility.
 */
function parseSignedHeader(header: string): { timestamp: number; signature: string } {
  let timestamp: number | undefined
  let signature: string | undefined

  for (const segment of header.split(',')) {
    const eq = segment.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = segment.slice(0, eq).trim()
    const value = segment.slice(eq + 1).trim()
    if (key === 't' && timestamp === undefined) {
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed) && String(parsed) === value) {
        timestamp = parsed
      }
    } else if (key === 'v1' && signature === undefined && value.length > 0) {
      signature = value
    }
  }

  if (timestamp === undefined) {
    throw new WebhookSignatureError('Webhook signature header missing or malformed timestamp (t=)')
  }
  if (signature === undefined) {
    throw new WebhookSignatureError('Webhook signature header missing v1 scheme')
  }

  return { timestamp, signature }
}

/**
 * Webhooks handler class
 */
export class Webhooks {
  private readonly signingSecret: string
  private readonly timestampTolerance: number

  /**
   * Build a webhook handler bound to a specific HMAC SHA-256 signing secret.
   *
   * @param config Handler configuration. `signingSecret` must be non-empty;
   *   provide `FAM_WEBHOOK_SIGNING_SECRET` from the FAM admin per environment.
   *   `timestampTolerance` is optional (default 300s) and only applies to
   *   {@link Webhooks.verifySigned} / {@link Webhooks.constructEventSigned}.
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

    const tolerance = config.timestampTolerance ?? DEFAULT_TIMESTAMP_TOLERANCE_SECONDS
    if (!Number.isFinite(tolerance) || tolerance <= 0) {
      throw new WebhookSignatureError(
        `timestampTolerance must be a positive finite number of seconds, received ${String(tolerance)}`
      )
    }
    this.timestampTolerance = tolerance
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
   * Verify a webhook signature **with replay protection**, parsing a
   * Stripe-style header of the form `t=<unix-timestamp>,v1=<hex-hmac>`.
   *
   * The HMAC is computed over `${timestamp}.${payload}` rather than the
   * payload alone, so an attacker who captures a legitimate webhook cannot
   * replay it later with a different timestamp without invalidating the
   * signature. The timestamp is then checked to be within
   * `[now - timestampTolerance, now + timestampTolerance]` (default 300s),
   * which closes the replay window even when the captured request is
   * replayed verbatim.
   *
   * Header format (mirrors Stripe):
   *
   * ```text
   * t=1714579200,v1=2a8c5f...e3b9
   * ```
   *
   * - `t` is the Unix timestamp **in seconds** at signing time.
   * - `v1` is the lowercase hex HMAC-SHA256 of `${t}.${payload}`.
   *
   * @returns `true` if the signature is valid and the timestamp is within
   *   tolerance, `false` if the signature is well-formed but does not match.
   * @throws {WebhookSignatureError} If the header is missing, malformed, has
   *   an unparseable timestamp, or falls outside the tolerance window.
   */
  verifySigned(payload: string, signatureHeader: string | undefined): boolean {
    if (signatureHeader === undefined || signatureHeader.length === 0) {
      throw new WebhookSignatureError('Missing webhook signature header')
    }

    const { timestamp, signature } = parseSignedHeader(signatureHeader)

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > this.timestampTolerance) {
      throw new WebhookSignatureError(
        `Webhook timestamp ${String(timestamp)} is outside the ${String(this.timestampTolerance)}s tolerance window`
      )
    }

    const expected = this.computeSignature(`${String(timestamp)}.${payload}`)
    return this.secureCompare(signature, expected)
  }

  /**
   * Verify a Stripe-style signed header (with replay protection) **and**
   * validate the payload in a single call. Recommended over
   * {@link Webhooks.constructEvent} when the producer emits signed
   * timestamps.
   *
   * @throws {WebhookSignatureError} If the header is missing, malformed,
   *   the timestamp is outside the tolerance window, or the HMAC does not
   *   match.
   * @throws {WebhookPayloadError}   If the payload is not valid JSON, is
   *   not an object, has an unknown `EventType`, or has missing/wrongly-
   *   typed required fields.
   */
  constructEventSigned(payload: string, signatureHeader: string | undefined): WebhookEvent {
    if (!this.verifySigned(payload, signatureHeader)) {
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

// Note: error classes (WebhookSignatureError, WebhookPayloadError) and the
// related webhook types are exported from the root entry-point (./index.ts)
// and re-exported from the /webhooks subpath via ./index.ts, which delegates
// to the package itself so the runtime classes are shared across entry-points
// and `instanceof` works regardless of where consumers import from.
