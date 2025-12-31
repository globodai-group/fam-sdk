import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HttpClient } from '../client.js'
import { BaseModule } from '../modules/base.js'
import {
  UsersModule,
  WalletsModule,
  PayinsModule,
  PayoutsModule,
  TransfersModule,
  CardsModule,
  CardRegistrationsModule,
  PreauthorizationsModule,
  BankAccountsModule,
  KycModule,
  UboModule,
  ScaRecipientsModule,
  SubscriptionsModule,
} from '../modules/index.js'

// Mock fetch globally
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

describe('BaseModule', () => {
  class TestModule extends BaseModule {
    constructor(client: HttpClient) {
      super(client, '/api/v1/test')
    }

    async testGet() {
      return this.client.get(this.path(''))
    }

    async testPost(data: unknown) {
      return this.post('', data)
    }

    async testPut(id: string, data: unknown) {
      return this.put(id, data)
    }
  }

  let client: HttpClient
  let module: TestModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new TestModule(client)
  })

  it('should build correct path', async () => {
    mockSuccessResponse({ data: [] })
    await module.testGet()
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/test',
      expect.any(Object)
    )
  })

  it('should call post correctly', async () => {
    mockSuccessResponse({ id: 1 })
    await module.testPost({ name: 'test' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    )
  })

  it('should call put correctly', async () => {
    mockSuccessResponse({ id: 1 })
    await module.testPut('123', { name: 'updated' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/test/123',
      expect.objectContaining({
        method: 'PUT',
      })
    )
  })
})

describe('UsersModule', () => {
  let client: HttpClient
  let module: UsersModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new UsersModule(client)
  })

  it('should create natural user', async () => {
    mockSuccessResponse({ Id: 'user-123' })
    const result = await module.createNatural({
      Email: 'test@example.com',
      FirstName: 'John',
      LastName: 'Doe',
      Birthday: 631152000,
      Nationality: 'FR',
      CountryOfResidence: 'FR',
    })
    expect(result.Id).toBe('user-123')
  })

  it('should get user by id', async () => {
    mockSuccessResponse({ Id: 'user-123', Email: 'test@example.com' })
    const result = await module.getUser('user-123')
    expect(result.Id).toBe('user-123')
  })

  it('should update natural user', async () => {
    mockSuccessResponse({ Id: 'user-123' })
    await module.updateNatural('user-123', { FirstName: 'Jane' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/user-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should create legal user', async () => {
    mockSuccessResponse({ Id: 'legal-123' })
    const result = await module.createLegal({
      Email: 'company@example.com',
      Name: 'ACME Corp',
      LegalPersonType: 'BUSINESS',
      LegalRepresentativeFirstName: 'John',
      LegalRepresentativeLastName: 'Doe',
      LegalRepresentativeBirthday: 631152000,
      LegalRepresentativeNationality: 'FR',
      LegalRepresentativeCountryOfResidence: 'FR',
    })
    expect(result.Id).toBe('legal-123')
  })

  it('should get user wallets', async () => {
    mockSuccessResponse([{ Id: 'wallet-1' }])
    const result = await module.getWallets('user-123')
    expect(result).toHaveLength(1)
  })

  it('should get user cards', async () => {
    mockSuccessResponse([{ Id: 'card-1' }])
    const result = await module.getCards('user-123')
    expect(result).toHaveLength(1)
  })

  it('should get user bank accounts', async () => {
    mockSuccessResponse([{ Id: 'bank-1' }])
    const result = await module.getBankAccounts('user-123')
    expect(result).toHaveLength(1)
  })

  it('should get user transactions', async () => {
    mockSuccessResponse([{ Id: 'tx-1' }])
    const result = await module.getTransactions('user-123')
    expect(result).toHaveLength(1)
  })
})

describe('WalletsModule', () => {
  let client: HttpClient
  let module: WalletsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new WalletsModule(client)
  })

  it('should create wallet', async () => {
    mockSuccessResponse({ Id: 'wallet-123' })
    const result = await module.create({
      Owners: ['user-123'],
      Description: 'Test wallet',
      Currency: 'EUR',
    })
    expect(result.Id).toBe('wallet-123')
  })

  it('should get wallet by id', async () => {
    mockSuccessResponse({ Id: 'wallet-123' })
    const result = await module.getWallet('wallet-123')
    expect(result.Id).toBe('wallet-123')
  })

  it('should get wallet transactions', async () => {
    mockSuccessResponse([{ Id: 'tx-1' }])
    const result = await module.getTransactions('wallet-123')
    expect(result).toHaveLength(1)
  })
})

describe('PayinsModule', () => {
  let client: HttpClient
  let module: PayinsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new PayinsModule(client)
  })

  it('should create payin', async () => {
    mockSuccessResponse({ Id: 'payin-123' })
    const result = await module.create({
      AuthorId: 'user-123',
      CreditedWalletId: 'wallet-123',
      DebitedFunds: { Amount: 1000, Currency: 'EUR' },
      Fees: { Amount: 0, Currency: 'EUR' },
      CardId: 'card-123',
      SecureModeReturnURL: 'https://example.com/return',
    })
    expect(result.Id).toBe('payin-123')
  })

  it('should get payin by id', async () => {
    mockSuccessResponse({ Id: 'payin-123' })
    const result = await module.getPayin('payin-123')
    expect(result.Id).toBe('payin-123')
  })

  it('should refund payin', async () => {
    mockSuccessResponse({ Id: 'refund-123' })
    const result = await module.refund('payin-123', { AuthorId: 'user-123' })
    expect(result.Id).toBe('refund-123')
  })
})

describe('PayoutsModule', () => {
  let client: HttpClient
  let module: PayoutsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new PayoutsModule(client)
  })

  it('should create payout', async () => {
    mockSuccessResponse({ Id: 'payout-123' })
    const result = await module.create({
      AuthorId: 'user-123',
      DebitedWalletId: 'wallet-123',
      DebitedFunds: { Amount: 1000, Currency: 'EUR' },
      Fees: { Amount: 0, Currency: 'EUR' },
      BankAccountId: 'bank-123',
    })
    expect(result.Id).toBe('payout-123')
  })

  it('should get payout by id', async () => {
    mockSuccessResponse({ Id: 'payout-123' })
    const result = await module.getPayout('payout-123')
    expect(result.Id).toBe('payout-123')
  })
})

describe('TransfersModule', () => {
  let client: HttpClient
  let module: TransfersModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new TransfersModule(client)
  })

  it('should create transfer', async () => {
    mockSuccessResponse({ Id: 'transfer-123' })
    const result = await module.create({
      AuthorId: 'user-123',
      DebitedWalletId: 'wallet-1',
      CreditedWalletId: 'wallet-2',
      DebitedFunds: { Amount: 1000, Currency: 'EUR' },
      Fees: { Amount: 0, Currency: 'EUR' },
    })
    expect(result.Id).toBe('transfer-123')
  })

  it('should get transfer by id', async () => {
    mockSuccessResponse({ Id: 'transfer-123' })
    const result = await module.getTransfer('transfer-123')
    expect(result.Id).toBe('transfer-123')
  })

  it('should refund transfer', async () => {
    mockSuccessResponse({ Id: 'refund-123' })
    const result = await module.refund('transfer-123', { AuthorId: 'user-123' })
    expect(result.Id).toBe('refund-123')
  })
})

describe('CardsModule', () => {
  let client: HttpClient
  let module: CardsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new CardsModule(client)
  })

  it('should get card by id', async () => {
    mockSuccessResponse({ Id: 'card-123' })
    const result = await module.getCard('card-123')
    expect(result.Id).toBe('card-123')
  })

  it('should deactivate card', async () => {
    mockSuccessResponse({ Id: 'card-123', Active: false })
    const result = await module.deactivate('card-123')
    expect(result.Active).toBe(false)
  })
})

describe('CardRegistrationsModule', () => {
  let client: HttpClient
  let module: CardRegistrationsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new CardRegistrationsModule(client)
  })

  it('should create card registration', async () => {
    mockSuccessResponse({ Id: 'reg-123' })
    const result = await module.create({
      UserId: 'user-123',
      Currency: 'EUR',
      CardType: 'CB_VISA_MASTERCARD',
    })
    expect(result.Id).toBe('reg-123')
  })

  it('should get registration by id', async () => {
    mockSuccessResponse({ Id: 'reg-123' })
    const result = await module.getRegistration('reg-123')
    expect(result.Id).toBe('reg-123')
  })

  it('should update registration', async () => {
    mockSuccessResponse({ Id: 'reg-123' })
    const result = await module.update('reg-123', {
      RegistrationData: 'data=xxx',
    })
    expect(result.Id).toBe('reg-123')
  })
})

describe('PreauthorizationsModule', () => {
  let client: HttpClient
  let module: PreauthorizationsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new PreauthorizationsModule(client)
  })

  it('should create preauthorization', async () => {
    mockSuccessResponse({ Id: 'preauth-123' })
    const result = await module.create({
      AuthorId: 'user-123',
      DebitedFunds: { Amount: 1000, Currency: 'EUR' },
      CardId: 'card-123',
      SecureModeReturnURL: 'https://example.com/return',
    })
    expect(result.Id).toBe('preauth-123')
  })

  it('should cancel preauthorization', async () => {
    mockSuccessResponse({ Id: 'preauth-123', PaymentStatus: 'CANCELED' })
    const result = await module.cancel('preauth-123')
    expect(result.PaymentStatus).toBe('CANCELED')
  })
})

describe('BankAccountsModule', () => {
  let client: HttpClient
  let module: BankAccountsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new BankAccountsModule(client, 'user-123')
  })

  it('should create IBAN bank account', async () => {
    mockSuccessResponse({ Id: 'bank-123' })
    const result = await module.createIban({
      OwnerName: 'John Doe',
      OwnerAddress: {
        AddressLine1: '123 Street',
        City: 'Paris',
        PostalCode: '75001',
        Country: 'FR',
      },
      IBAN: 'FR7630004000031234567890143',
    })
    expect(result.Id).toBe('bank-123')
  })

  it('should get bank account by id', async () => {
    mockSuccessResponse({ Id: 'bank-123' })
    const result = await module.getAccount('bank-123')
    expect(result.Id).toBe('bank-123')
  })

  it('should list bank accounts', async () => {
    mockSuccessResponse({ data: [{ Id: 'bank-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })

  it('should deactivate bank account', async () => {
    mockSuccessResponse({ Id: 'bank-123', Active: false })
    await module.deactivate('bank-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/bank-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })
})

describe('KycModule', () => {
  let client: HttpClient
  let module: KycModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new KycModule(client, 'user-123')
  })

  it('should create KYC document', async () => {
    mockSuccessResponse({ Id: 'kyc-123' })
    const result = await module.create({ Type: 'IDENTITY_PROOF' })
    expect(result.Id).toBe('kyc-123')
  })

  it('should get document by id', async () => {
    mockSuccessResponse({ Id: 'kyc-123' })
    const result = await module.getDocument('kyc-123')
    expect(result.Id).toBe('kyc-123')
  })

  it('should list documents', async () => {
    mockSuccessResponse({ data: [{ Id: 'kyc-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })

  it('should create page', async () => {
    mockSuccessResponse(undefined)
    await module.createPage('kyc-123', 'base64data')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/kyc-123/pages'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should submit document', async () => {
    mockSuccessResponse({ Id: 'kyc-123', Status: 'VALIDATION_ASKED' })
    const result = await module.submit('kyc-123')
    expect(result.Status).toBe('VALIDATION_ASKED')
  })
})

describe('UboModule', () => {
  let client: HttpClient
  let module: UboModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new UboModule(client, 'user-123')
  })

  it('should create declaration', async () => {
    mockSuccessResponse({ Id: 'ubo-dec-123' })
    const result = await module.createDeclaration()
    expect(result.Id).toBe('ubo-dec-123')
  })

  it('should get declaration', async () => {
    mockSuccessResponse({ Id: 'ubo-dec-123' })
    const result = await module.getDeclaration('ubo-dec-123')
    expect(result.Id).toBe('ubo-dec-123')
  })

  it('should create UBO', async () => {
    mockSuccessResponse({ Id: 'ubo-123' })
    const result = await module.createUbo('ubo-dec-123', {
      FirstName: 'John',
      LastName: 'Doe',
      Birthday: 631152000,
      Nationality: 'FR',
      Birthplace: { City: 'Paris', Country: 'FR' },
      Address: { AddressLine1: '123 Street', City: 'Paris', PostalCode: '75001', Country: 'FR' },
    })
    expect(result.Id).toBe('ubo-123')
  })

  it('should submit declaration', async () => {
    mockSuccessResponse({ Id: 'ubo-dec-123', Status: 'VALIDATION_ASKED' })
    const result = await module.submit('ubo-dec-123')
    expect(result.Status).toBe('VALIDATION_ASKED')
  })
})

describe('ScaRecipientsModule', () => {
  let client: HttpClient
  let module: ScaRecipientsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new ScaRecipientsModule(client, 'user-123')
  })

  it('should create recipient', async () => {
    mockSuccessResponse({ Id: 'recipient-123' })
    const result = await module.create({
      DisplayName: 'Test Recipient',
      PayoutMethodType: 'INTERNATIONAL_BANK_TRANSFER',
      Currency: 'EUR',
      RecipientType: 'INDIVIDUAL',
      IndividualRecipient: {
        FirstName: 'John',
        LastName: 'Doe',
      },
    })
    expect(result.Id).toBe('recipient-123')
  })

  it('should get recipient by id', async () => {
    mockSuccessResponse({ Id: 'recipient-123' })
    const result = await module.getRecipient('recipient-123')
    expect(result.Id).toBe('recipient-123')
  })

  it('should list recipients', async () => {
    mockSuccessResponse({ data: [{ Id: 'recipient-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })
})

describe('SubscriptionsModule', () => {
  let client: HttpClient
  let module: SubscriptionsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new SubscriptionsModule(client)
  })

  it('should register subscription', async () => {
    mockSuccessResponse({ id: 'sub-123' })
    const result = await module.register({
      userId: 'user-123',
      mangopayUserId: 'mp-user-123',
      walletId: 'wallet-123',
      cardId: 'card-123',
      amount: 1000,
      currency: 'EUR',
      frequency: 'MONTHLY',
    })
    expect(result.id).toBe('sub-123')
  })

  it('should get subscription by id', async () => {
    mockSuccessResponse({ id: 'sub-123' })
    const result = await module.getSubscription('sub-123')
    expect(result.id).toBe('sub-123')
  })

  it('should list subscriptions', async () => {
    mockSuccessResponse({ data: [{ id: 'sub-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })

  it('should cancel subscription', async () => {
    mockSuccessResponse({ id: 'sub-123', status: 'ENDED' })
    const result = await module.cancel('sub-123')
    expect(result.status).toBe('ENDED')
  })

  it('should enable subscription', async () => {
    mockSuccessResponse({ id: 'sub-123', status: 'ACTIVE' })
    const result = await module.enable('sub-123')
    expect(result.status).toBe('ACTIVE')
  })

  it('should disable subscription', async () => {
    mockSuccessResponse({ id: 'sub-123', status: 'PAUSED' })
    const result = await module.disable('sub-123')
    expect(result.status).toBe('PAUSED')
  })

  it('should sync subscription', async () => {
    mockSuccessResponse({ synced: true })
    const result = await module.sync('sub-123')
    expect(result.synced).toBe(true)
  })
})
