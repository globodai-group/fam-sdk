import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Fam } from '../fam.js'
import {
  BankAccountsModule,
  CardsModule,
  CardRegistrationsModule,
  KycModule,
  PayinsModule,
  PayoutsModule,
  PreauthorizationsModule,
  ScaRecipientsModule,
  SubscriptionsModule,
  TransfersModule,
  UboModule,
  UsersModule,
  WalletsModule,
} from '../modules/index.js'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Fam', () => {
  let client: Fam

  beforeEach(() => {
    vi.clearAllMocks()
    client = new Fam({
      baseUrl: 'https://api.example.com',
      token: 'test-token',
    })
  })

  describe('constructor', () => {
    it('should create client with required options', () => {
      const c = new Fam({ baseUrl: 'https://api.example.com' })
      expect(c).toBeInstanceOf(Fam)
    })

    it('should create client with all options', () => {
      const c = new Fam({
        baseUrl: 'https://api.example.com',
        token: 'token',
        timeout: 60000,
        retries: 5,
        headers: { 'X-Custom': 'value' },
      })
      expect(c).toBeInstanceOf(Fam)
    })
  })

  describe('core modules', () => {
    it('should have users module', () => {
      expect(client.users).toBeInstanceOf(UsersModule)
    })

    it('should have wallets module', () => {
      expect(client.wallets).toBeInstanceOf(WalletsModule)
    })

    it('should have payins module', () => {
      expect(client.payins).toBeInstanceOf(PayinsModule)
    })

    it('should have payouts module', () => {
      expect(client.payouts).toBeInstanceOf(PayoutsModule)
    })

    it('should have transfers module', () => {
      expect(client.transfers).toBeInstanceOf(TransfersModule)
    })
  })

  describe('card modules', () => {
    it('should have cards module', () => {
      expect(client.cards).toBeInstanceOf(CardsModule)
    })

    it('should have cardRegistrations module', () => {
      expect(client.cardRegistrations).toBeInstanceOf(CardRegistrationsModule)
    })

    it('should have preauthorizations module', () => {
      expect(client.preauthorizations).toBeInstanceOf(PreauthorizationsModule)
    })
  })

  describe('fam modules', () => {
    it('should have subscriptions module', () => {
      expect(client.subscriptions).toBeInstanceOf(SubscriptionsModule)
    })
  })

  describe('user-scoped modules', () => {
    it('should create bankAccounts module for user', () => {
      const module = client.bankAccounts('user-123')
      expect(module).toBeInstanceOf(BankAccountsModule)
    })

    it('should create kyc module for user', () => {
      const module = client.kyc('user-123')
      expect(module).toBeInstanceOf(KycModule)
    })

    it('should create ubo module for user', () => {
      const module = client.ubo('user-123')
      expect(module).toBeInstanceOf(UboModule)
    })

    it('should create scaRecipients module for user', () => {
      const module = client.scaRecipients('user-123')
      expect(module).toBeInstanceOf(ScaRecipientsModule)
    })
  })

  describe('setToken', () => {
    it('should update the token', () => {
      client.setToken('new-token')
      // Token is internal, we just verify no error is thrown
      expect(client).toBeInstanceOf(Fam)
    })
  })

  describe('clearToken', () => {
    it('should clear the token', () => {
      client.clearToken()
      // Token is internal, we just verify no error is thrown
      expect(client).toBeInstanceOf(Fam)
    })
  })
})
