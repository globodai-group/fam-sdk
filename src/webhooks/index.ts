/**
 * Webhooks handler for Mangopay and FAM events
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { WebhookSignatureError } from '../errors/index.js'
import type {
  FamEventType,
  MangopayEventType,
  WebhookEvent,
  WebhookHandlerConfig,
} from '../types/webhooks.js'

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
  private readonly signingSecret?: string
  private readonly timestampTolerance: number

  constructor(config: WebhookHandlerConfig = {}) {
    this.signingSecret = config.signingSecret
    this.timestampTolerance = config.timestampTolerance ?? 300 // 5 minutes default
  }

  /**
   * Verify webhook signature
   */
  verify(payload: string, signature: string | undefined): boolean {
    if (this.signingSecret === undefined) {
      // No signing secret configured, skip verification
      return true
    }

    if (signature === undefined || signature.length === 0) {
      throw new WebhookSignatureError('Missing webhook signature')
    }

    try {
      const expectedSignature = this.computeSignature(payload)
      return this.secureCompare(signature, expectedSignature)
    } catch {
      throw new WebhookSignatureError('Invalid webhook signature')
    }
  }

  /**
   * Verify webhook with timestamp validation
   */
  verifyWithTimestamp(payload: string, signature: string | undefined, timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000)
    const age = Math.abs(now - timestamp)

    if (age > this.timestampTolerance) {
      throw new WebhookSignatureError(`Webhook timestamp too old (${String(age)} seconds)`)
    }

    return this.verify(payload, signature)
  }

  /**
   * Parse webhook payload
   */
  parse(payload: unknown): WebhookEvent {
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload) as WebhookEvent
      } catch {
        throw new WebhookSignatureError('Invalid webhook payload: not valid JSON')
      }
    }

    if (typeof payload === 'object' && payload !== null) {
      return payload as WebhookEvent
    }

    throw new WebhookSignatureError('Invalid webhook payload: expected object or JSON string')
  }

  /**
   * Construct and verify webhook event
   */
  constructEvent(payload: string, signature: string | undefined): WebhookEvent {
    this.verify(payload, signature)
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
    if (this.signingSecret === undefined) {
      throw new Error('Signing secret not configured')
    }

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
