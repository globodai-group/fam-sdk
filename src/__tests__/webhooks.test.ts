import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { WebhookSignatureError } from '../errors/index.js'
import { isFamEvent, isMangopayEvent, Webhooks } from '../webhooks/index.js'

describe('isMangopayEvent', () => {
  it('should return true for mangopay events', () => {
    expect(isMangopayEvent('PAYIN_NORMAL_CREATED')).toBe(true)
    expect(isMangopayEvent('KYC_SUCCEEDED')).toBe(true)
    expect(isMangopayEvent('USER_KYC_REGULAR')).toBe(true)
  })

  it('should return false for FAM events', () => {
    expect(isMangopayEvent('FAM_SUBSCRIPTION_CREATED')).toBe(false)
  })
})

describe('isFamEvent', () => {
  it('should return true for FAM events', () => {
    expect(isFamEvent('FAM_SUBSCRIPTION_CREATED')).toBe(true)
    expect(isFamEvent('FAM_SUBSCRIPTION_PAYMENT_SUCCEEDED')).toBe(true)
  })

  it('should return false for mangopay events', () => {
    expect(isFamEvent('PAYIN_NORMAL_CREATED')).toBe(false)
  })
})

describe('Webhooks', () => {
  describe('constructor', () => {
    it('should throw without a signing secret', () => {
      expect(() => new Webhooks({} as unknown as { signingSecret: string })).toThrow(
        WebhookSignatureError
      )
    })

    it('should throw with an empty signing secret', () => {
      expect(() => new Webhooks({ signingSecret: '' })).toThrow(WebhookSignatureError)
    })

    it('should create webhooks handler with signing secret', () => {
      const handler = new Webhooks({ signingSecret: 'secret' })
      expect(handler).toBeInstanceOf(Webhooks)
    })
  })

  describe('parse', () => {
    const webhooks = new Webhooks({ signingSecret: 'secret' })

    it('should parse valid json string payload', () => {
      const payload = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: '123456',
        Date: 1234567890,
      })

      const event = webhooks.parse(payload)
      expect(event.EventType).toBe('PAYIN_NORMAL_SUCCEEDED')
      expect(event.RessourceId).toBe('123456')
    })

    it('should parse object payload', () => {
      const payload = {
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: '123456',
        Date: 1234567890,
      }

      const event = webhooks.parse(payload as unknown as string)
      expect(event.EventType).toBe('PAYIN_NORMAL_SUCCEEDED')
    })

    it('should throw on invalid json', () => {
      expect(() => webhooks.parse('invalid json {')).toThrow(WebhookSignatureError)
    })

    it('should throw on null payload', () => {
      expect(() => webhooks.parse(null as unknown as string)).toThrow(WebhookSignatureError)
    })

    it('should throw on undefined payload', () => {
      expect(() => webhooks.parse(undefined as unknown as string)).toThrow(WebhookSignatureError)
    })
  })

  describe('verify with signing secret', () => {
    const signingSecret = 'test-secret-key'
    const webhooks = new Webhooks({ signingSecret })

    it('should throw when signature is undefined', () => {
      expect(() => webhooks.verify('payload', undefined)).toThrow(WebhookSignatureError)
    })

    it('should throw when signature is empty', () => {
      expect(() => webhooks.verify('payload', '')).toThrow(WebhookSignatureError)
    })

    it('should return false for invalid signature', () => {
      const result = webhooks.verify('payload', 'invalid-signature-that-is-long-enough')
      expect(result).toBe(false)
    })
  })

  describe('constructEvent with signing secret', () => {
    const signingSecret = 'test-secret-key'
    const webhooks = new Webhooks({ signingSecret })

    const payload = JSON.stringify({
      EventType: 'PAYIN_NORMAL_SUCCEEDED',
      RessourceId: '123456',
      Date: 1234567890,
    })

    const sign = (body: string, secret: string): string =>
      createHmac('sha256', secret).update(body).digest('hex')

    it('should throw when signature is missing', () => {
      expect(() => webhooks.constructEvent(payload, undefined)).toThrow(WebhookSignatureError)
    })

    it('should throw when signature was computed with a different secret', () => {
      const forgedSignature = sign(payload, 'wrong-secret')

      expect(() => webhooks.constructEvent(payload, forgedSignature)).toThrow(WebhookSignatureError)
    })

    it('should throw when signature is the right length but garbage', () => {
      const garbageSignature = 'a'.repeat(64)

      expect(() => webhooks.constructEvent(payload, garbageSignature)).toThrow(
        WebhookSignatureError
      )
    })

    it('should construct event when signature is valid', () => {
      const validSignature = sign(payload, signingSecret)

      const event = webhooks.constructEvent(payload, validSignature)
      expect(event.EventType).toBe('PAYIN_NORMAL_SUCCEEDED')
      expect(event.RessourceId).toBe('123456')
    })
  })

  describe('isEventType', () => {
    const webhooks = new Webhooks({ signingSecret: 'secret' })

    it('should return true for matching event type', () => {
      const event = {
        EventType: 'PAYIN_NORMAL_SUCCEEDED' as const,
        RessourceId: '123',
        Date: 1234567890,
      }

      expect(webhooks.isEventType(event, 'PAYIN_NORMAL_SUCCEEDED')).toBe(true)
    })

    it('should return false for non-matching event type', () => {
      const event = {
        EventType: 'PAYIN_NORMAL_SUCCEEDED' as const,
        RessourceId: '123',
        Date: 1234567890,
      }

      expect(webhooks.isEventType(event, 'PAYIN_NORMAL_FAILED')).toBe(false)
    })
  })
})
