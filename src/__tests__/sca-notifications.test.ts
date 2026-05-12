import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HttpClient } from '../client.js'
import { ScaNotificationsModule } from '../modules/sca-notifications.js'

const mockFetch = vi.fn()
global.fetch = mockFetch

function createMockClient(): HttpClient {
  return new HttpClient({
    baseUrl: 'https://api.example.com',
    token: 'test-token',
    retries: 0,
  })
}

function mockSuccessResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    status: 200,
    headers: new Headers(),
  })
}

const TOKEN = '11111111-2222-3333-4444-555555555555'

describe('ScaNotificationsModule', () => {
  let module: ScaNotificationsModule

  beforeEach(() => {
    mockFetch.mockReset()
    module = new ScaNotificationsModule(createMockClient())
  })

  describe('show', () => {
    it('hits GET /api/v1/sca/sca-notifications/:token', async () => {
      mockSuccessResponse({
        notificationToken: TOKEN,
        action: 'payout',
        amount: 5000,
        sentAt: '2026-05-12T10:00:00.000Z',
        expiresAt: '2026-05-19T10:00:00.000Z',
        validatedAt: null,
        expired: false,
      })

      const result = await module.show(TOKEN)

      expect(mockFetch).toHaveBeenCalledOnce()
      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[0]).toContain(`/api/v1/sca/sca-notifications/${TOKEN}`)
      expect(callArgs[1]?.method).toBe('GET')
      expect(result.notificationToken).toBe(TOKEN)
    })
  })

  describe('redirect', () => {
    it('hits POST .../redirect with mangopayEnv + resourceId as null when omitted', async () => {
      mockSuccessResponse({ redirectUrl: 'https://sca.mangopay.com/?token=fresh' })

      await module.redirect(TOKEN)

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain(`/api/v1/sca/sca-notifications/${TOKEN}/redirect`)
      expect(init.method).toBe('POST')
      const body = JSON.parse(init.body as string) as Record<string, unknown>
      expect(body.mangopayEnv).toBeNull()
      expect(body.resourceId).toBeNull()
      expect('returnUrl' in body).toBe(false)
    })

    it('passes returnUrl in the body when supplied', async () => {
      mockSuccessResponse({ redirectUrl: 'https://sca.mangopay.com/?token=fresh' })

      await module.redirect(TOKEN, {
        mangopayEnv: 'prod',
        resourceId: 'payout-xyz',
        returnUrl: 'https://fidelio.app/sca/done?notif=' + TOKEN,
      })

      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as Record<string, unknown>
      expect(body.mangopayEnv).toBe('prod')
      expect(body.resourceId).toBe('payout-xyz')
      expect(body.returnUrl).toBe('https://fidelio.app/sca/done?notif=' + TOKEN)
    })

    it('omits returnUrl when set to null', async () => {
      mockSuccessResponse({ redirectUrl: 'x' })
      await module.redirect(TOKEN, { returnUrl: null })
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      const body = JSON.parse(init.body as string) as Record<string, unknown>
      expect('returnUrl' in body).toBe(false)
    })
  })

  describe('validated', () => {
    it('hits POST .../validated with no body fields needed', async () => {
      mockSuccessResponse({ validated: true, validatedAt: '2026-05-12T10:05:00.000Z' })

      const result = await module.validated(TOKEN)

      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain(`/api/v1/sca/sca-notifications/${TOKEN}/validated`)
      expect(init.method).toBe('POST')
      expect(result.validated).toBe(true)
    })
  })
})
