import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { WebhookPayloadError, WebhookSignatureError } from '../errors/index.js'
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

    it('should throw WebhookPayloadError on invalid json', () => {
      expect(() => webhooks.parse('invalid json {')).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on null payload', () => {
      expect(() => webhooks.parse(null as unknown as string)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on undefined payload', () => {
      expect(() => webhooks.parse(undefined as unknown as string)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on payload with unknown EventType', () => {
      const payload = JSON.stringify({
        EventType: 'NOT_A_REAL_EVENT',
        RessourceId: '123',
        Date: 1,
      })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on payload missing EventType', () => {
      const payload = JSON.stringify({ RessourceId: '123', Date: 1 })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on payload with non-string RessourceId', () => {
      const payload = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: 123,
        Date: 1,
      })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on payload with non-numeric Date', () => {
      const payload = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: '123',
        Date: 'yesterday',
      })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
    })

    it('should throw WebhookPayloadError on array payload', () => {
      expect(() => webhooks.parse('[]')).toThrow(WebhookPayloadError)
    })

    it('should accept FAM event with valid Data object', () => {
      const payload = JSON.stringify({
        EventType: 'FAM_SUBSCRIPTION_CREATED',
        RessourceId: 'sub_1',
        Date: 1,
        Data: { plan: 'pro' },
      })
      const event = webhooks.parse(payload)
      expect(event.EventType).toBe('FAM_SUBSCRIPTION_CREATED')
    })

    it('should throw WebhookPayloadError on FAM event with non-object Data', () => {
      const payload = JSON.stringify({
        EventType: 'FAM_SUBSCRIPTION_CREATED',
        RessourceId: 'sub_1',
        Date: 1,
        Data: 'not-an-object',
      })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
    })

    it('should not classify payload errors as signature errors', () => {
      const payload = JSON.stringify({
        EventType: 'NOT_A_REAL_EVENT',
        RessourceId: '123',
        Date: 1,
      })
      expect(() => webhooks.parse(payload)).not.toThrow(WebhookSignatureError)
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

    it('should return false for invalid signature of the right length', () => {
      const wrong = 'a'.repeat(64)
      expect(webhooks.verify('payload', wrong)).toBe(false)
    })

    it('should return false for signature of wrong length', () => {
      expect(webhooks.verify('payload', 'short')).toBe(false)
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

    it('should throw WebhookPayloadError (not WebhookSignatureError) when payload is well-signed but malformed', () => {
      const malformed = JSON.stringify({ foo: 'bar' })
      const validSignature = sign(malformed, signingSecret)

      expect(() => webhooks.constructEvent(malformed, validSignature)).toThrow(WebhookPayloadError)
      expect(() => webhooks.constructEvent(malformed, validSignature)).not.toThrow(
        WebhookSignatureError
      )
    })

    it('should reject signature with non-hex characters of the right length', () => {
      const garbage = 'z'.repeat(64)
      expect(() => webhooks.constructEvent(payload, garbage)).toThrow(WebhookSignatureError)
    })

    it('should reject when payload is mutated after signing (replay of mutated body)', () => {
      const validSignature = sign(payload, signingSecret)
      const tampered = payload.replace('"123456"', '"999999"')
      expect(() => webhooks.constructEvent(tampered, validSignature)).toThrow(WebhookSignatureError)
    })

    it('should reject very large payload signed with the wrong secret', () => {
      const largeBody = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: 'x'.repeat(100_000),
        Date: 1,
      })
      const forged = sign(largeBody, 'not-the-secret')
      expect(() => webhooks.constructEvent(largeBody, forged)).toThrow(WebhookSignatureError)
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

  describe('error class disjunction', () => {
    it('should keep WebhookSignatureError and WebhookPayloadError as distinct constructors', () => {
      // Their identity must not collapse: a consumer should be able to write
      // disjoint catch branches (`instanceof WebhookSignatureError` vs
      // `instanceof WebhookPayloadError`) and route to different HTTP codes.
      expect(WebhookSignatureError).not.toBe(WebhookPayloadError)
      const sig = new WebhookSignatureError()
      const payload = new WebhookPayloadError()
      expect(sig).toBeInstanceOf(WebhookSignatureError)
      expect(sig).not.toBeInstanceOf(WebhookPayloadError)
      expect(payload).toBeInstanceOf(WebhookPayloadError)
      expect(payload).not.toBeInstanceOf(WebhookSignatureError)
    })
  })
})
