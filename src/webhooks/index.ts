/**
 * Webhooks handler for Mangopay and FAM events
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { WebhookSignatureError } from '../errors/index.js'
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
    throw new WebhookSignatureError('Invalid webhook payload: expected a JSON object')
  }

  const obj = candidate as Record<string, unknown>

  if (!isKnownEventType(obj['EventType'])) {
    throw new WebhookSignatureError(
      `Invalid webhook payload: unknown or missing EventType (got ${String(obj['EventType'])})`
    )
  }

  if (typeof obj['RessourceId'] !== 'string' || obj['RessourceId'].length === 0) {
    throw new WebhookSignatureError(
      'Invalid webhook payload: RessourceId must be a non-empty string'
    )
  }

  if (typeof obj['Date'] !== 'number' || !Number.isFinite(obj['Date'])) {
    throw new WebhookSignatureError('Invalid webhook payload: Date must be a finite number')
  }

  if (
    obj['EventType'].startsWith('FAM_') &&
    obj['Data'] !== undefined &&
    (typeof obj['Data'] !== 'object' || obj['Data'] === null || Array.isArray(obj['Data']))
  ) {
    throw new WebhookSignatureError('Invalid webhook payload: Data must be an object when present')
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
   * Verify webhook signature
   */
  verify(payload: string, signature: string | undefined): boolean {
    if (signature === undefined || signature.length === 0) {
      throw new WebhookSignatureError('Missing webhook signature')
    }

    const expectedSignature = this.computeSignature(payload)
    return this.secureCompare(signature, expectedSignature)
  }

  /**
   * Parse webhook payload
   */
  parse(payload: unknown): WebhookEvent {
    let candidate: unknown

    if (typeof payload === 'string') {
      try {
        candidate = JSON.parse(payload)
      } catch {
        throw new WebhookSignatureError('Invalid webhook payload: not valid JSON')
      }
    } else if (typeof payload === 'object' && payload !== null) {
      candidate = payload
    } else {
      throw new WebhookSignatureError('Invalid webhook payload: expected object or JSON string')
    }

    return assertWebhookEvent(candidate)
  }

  /**
   * Construct and verify webhook event
   */
  constructEvent(payload: string, signature: string | undefined): WebhookEvent {
    if (!this.verify(payload, signature)) {
      throw new WebhookSignatureError('Invalid webhook signature')
    }
    return this.parse(payload)
  }

  /**
   * Check if the event is a specific type
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
