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

    it('should coerce a numeric-string Date to a number (real-world FAM fixture)', () => {
      // This is the exact payload shape FAM forwards on the wire: it
      // re-serializes the original Mangopay querystring, so `Date` arrives
      // as a numeric string. The SDK must accept it — anything stricter
      // silently drops every payout/payin event in production.
      const payload = JSON.stringify({
        Date: '1778674861',
        EventType: 'PAYOUT_NORMAL_FAILED',
        RessourceId: 'po_m_01KRGMH1CKZHVXQ82NJ83PY1KK',
      })
      const event = webhooks.parse(payload)
      expect(event.Date).toBe(1778674861)
      expect(typeof event.Date).toBe('number')
      expect(event.EventType).toBe('PAYOUT_NORMAL_FAILED')
      expect(event.RessourceId).toBe('po_m_01KRGMH1CKZHVXQ82NJ83PY1KK')
    })

    it('should accept a Date passed as the string "0"', () => {
      const payload = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: 'res_1',
        Date: '0',
      })
      expect(webhooks.parse(payload).Date).toBe(0)
    })

    it('should throw WebhookPayloadError when Date is an empty string', () => {
      const payload = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: 'res_1',
        Date: '',
      })
      expect(() => webhooks.parse(payload)).toThrow(WebhookPayloadError)
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

  describe('verifySigned (Stripe-style replay protection)', () => {
    const signingSecret = 'test-secret-key'

    const sign = (timestamp: number, body: string, secret: string): string =>
      createHmac('sha256', secret)
        .update(`${String(timestamp)}.${body}`)
        .digest('hex')

    const buildHeader = (timestamp: number, body: string, secret: string): string =>
      `t=${String(timestamp)},v1=${sign(timestamp, body, secret)}`

    it('should accept a freshly-signed valid header', () => {
      const webhooks = new Webhooks({ signingSecret })
      const body = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: '1',
        Date: 1,
      })
      const ts = Math.floor(Date.now() / 1000)
      expect(webhooks.verifySigned(body, buildHeader(ts, body, signingSecret))).toBe(true)
    })

    it('should reject a header signed with a different secret', () => {
      const webhooks = new Webhooks({ signingSecret })
      const ts = Math.floor(Date.now() / 1000)
      const header = buildHeader(ts, 'body', 'other-secret')
      expect(webhooks.verifySigned('body', header)).toBe(false)
    })

    it('should throw when the header is missing', () => {
      const webhooks = new Webhooks({ signingSecret })
      expect(() => webhooks.verifySigned('body', undefined)).toThrow(WebhookSignatureError)
    })

    it('should throw when the timestamp segment is missing', () => {
      const webhooks = new Webhooks({ signingSecret })
      expect(() => webhooks.verifySigned('body', 'v1=abc')).toThrow(WebhookSignatureError)
    })

    it('should throw when the v1 segment is missing', () => {
      const webhooks = new Webhooks({ signingSecret })
      expect(() => webhooks.verifySigned('body', 't=1714579200')).toThrow(WebhookSignatureError)
    })

    it('should throw when the timestamp is not an integer string', () => {
      const webhooks = new Webhooks({ signingSecret })
      expect(() => webhooks.verifySigned('body', 't=abc,v1=xx')).toThrow(WebhookSignatureError)
    })

    it('should reject a captured signature replayed outside the tolerance window', () => {
      const webhooks = new Webhooks({ signingSecret, timestampTolerance: 60 })
      const stale = Math.floor(Date.now() / 1000) - 3600 // 1h ago
      const header = buildHeader(stale, 'body', signingSecret)
      expect(() => webhooks.verifySigned('body', header)).toThrow(WebhookSignatureError)
    })

    it('should reject a future-dated signature outside the tolerance window', () => {
      const webhooks = new Webhooks({ signingSecret, timestampTolerance: 60 })
      const future = Math.floor(Date.now() / 1000) + 3600
      const header = buildHeader(future, 'body', signingSecret)
      expect(() => webhooks.verifySigned('body', header)).toThrow(WebhookSignatureError)
    })

    it('should refuse a tampered payload signed with the original timestamp', () => {
      const webhooks = new Webhooks({ signingSecret })
      const ts = Math.floor(Date.now() / 1000)
      const header = buildHeader(ts, 'original', signingSecret)
      expect(webhooks.verifySigned('tampered', header)).toBe(false)
    })

    it('should refuse a v1 signature copied from another timestamp (timestamp swap)', () => {
      const webhooks = new Webhooks({ signingSecret })
      const ts = Math.floor(Date.now() / 1000)
      // Take a signature legitimately produced for ts, but advertise a
      // different timestamp in the header. The HMAC over `${ts2}.${body}`
      // will not match the v1 from `${ts}.${body}`.
      const realSig = sign(ts, 'body', signingSecret)
      const ts2 = ts + 1
      expect(webhooks.verifySigned('body', `t=${String(ts2)},v1=${realSig}`)).toBe(false)
    })

    it('should reject negative or non-positive timestampTolerance at construction', () => {
      expect(() => new Webhooks({ signingSecret, timestampTolerance: 0 })).toThrow(
        WebhookSignatureError
      )
      expect(() => new Webhooks({ signingSecret, timestampTolerance: -10 })).toThrow(
        WebhookSignatureError
      )
      expect(
        () => new Webhooks({ signingSecret, timestampTolerance: Number.NaN as unknown as number })
      ).toThrow(WebhookSignatureError)
    })

    it('should ignore unknown signature schemes (e.g. v0, v2) for forward compatibility', () => {
      const webhooks = new Webhooks({ signingSecret })
      const ts = Math.floor(Date.now() / 1000)
      const v1 = sign(ts, 'body', signingSecret)
      const header = `t=${String(ts)},v0=ignored,v1=${v1},v2=also-ignored`
      expect(webhooks.verifySigned('body', header)).toBe(true)
    })
  })

  describe('constructEventSigned', () => {
    const signingSecret = 'test-secret-key'

    const buildHeader = (timestamp: number, body: string, secret: string): string =>
      `t=${String(timestamp)},v1=${createHmac('sha256', secret)
        .update(`${String(timestamp)}.${body}`)
        .digest('hex')}`

    it('should construct event when signed header is valid and payload well-formed', () => {
      const webhooks = new Webhooks({ signingSecret })
      const body = JSON.stringify({
        EventType: 'PAYIN_NORMAL_SUCCEEDED',
        RessourceId: '42',
        Date: 1,
      })
      const ts = Math.floor(Date.now() / 1000)
      const event = webhooks.constructEventSigned(body, buildHeader(ts, body, signingSecret))
      expect(event.EventType).toBe('PAYIN_NORMAL_SUCCEEDED')
      expect(event.RessourceId).toBe('42')
    })

    it('should throw WebhookSignatureError when signed header is invalid', () => {
      const webhooks = new Webhooks({ signingSecret })
      expect(() => webhooks.constructEventSigned('{}', 'garbage')).toThrow(WebhookSignatureError)
    })

    it('should throw WebhookPayloadError when signed correctly but payload malformed', () => {
      const webhooks = new Webhooks({ signingSecret })
      const ts = Math.floor(Date.now() / 1000)
      const body = JSON.stringify({ foo: 'bar' })
      const header = buildHeader(ts, body, signingSecret)
      expect(() => webhooks.constructEventSigned(body, header)).toThrow(WebhookPayloadError)
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
