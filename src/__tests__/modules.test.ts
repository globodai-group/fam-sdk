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
  BundlesModule,
  ProductsModule,
  PromotionsModule,
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

describe('BundlesModule', () => {
  let client: HttpClient
  let module: BundlesModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new BundlesModule(client)
  })

  it('should list bundles', async () => {
    mockSuccessResponse({ data: [{ id: 'bundle-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })

  it('should list bundles with filters', async () => {
    mockSuccessResponse({ data: [{ id: 'bundle-1' }], pagination: {} })
    const result = await module.list({ mangopayUserId: 'user-123', isActive: true })
    expect(result.data).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('mangopayUserId=user-123'),
      expect.any(Object)
    )
  })

  it('should get bundle by id', async () => {
    mockSuccessResponse({ id: 'bundle-123', subscriptions: [] })
    const result = await module.getBundle('bundle-123')
    expect(result.id).toBe('bundle-123')
  })

  it('should get bundle by code', async () => {
    mockSuccessResponse({ id: 'bundle-123', code: 'mbc_ibo_global' })
    const result = await module.getByCode('mbc_ibo_global')
    expect(result.code).toBe('mbc_ibo_global')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/code/mbc_ibo_global'),
      expect.any(Object)
    )
  })

  it('should validate bundle', async () => {
    mockSuccessResponse({ valid: true, errors: [], subscriptionsToDisable: [] })
    const result = await module.validate(['sub-1', 'sub-2'], 'user-123')
    expect(result.valid).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/validate'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should get bundle price', async () => {
    mockSuccessResponse({ finalPrice: 5000, originalPrice: 6000, currency: 'EUR' })
    const result = await module.getPrice(['sub-1', 'sub-2'], { billingPeriod: 'monthly' })
    expect(result.finalPrice).toBe(5000)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/price'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should create bundle from subscriptions', async () => {
    mockSuccessResponse({ bundle: { id: 'bundle-123' } })
    const result = await module.createFromSubscriptions({
      name: 'Test Bundle',
      subscriptionIds: ['sub-1', 'sub-2'],
      amount: 5000,
      billingPeriod: 'monthly',
      currency: 'EUR',
    })
    expect(result.bundle.id).toBe('bundle-123')
  })

  it('should subscribe to bundle', async () => {
    mockSuccessResponse({ bundle: { id: 'bundle-123' } })
    const result = await module.subscribe({
      name: 'Test Bundle',
      mangopayUserId: 'user-123',
      walletId: 'wallet-123',
      cardId: 'card-123',
      externalUserId: 'ext-user-123',
      items: [{ productType: 'mbc' }, { productType: 'ibo' }],
      amount: 5000,
      currency: 'EUR',
      billingPeriod: 'monthly',
    })
    expect(result.bundle.id).toBe('bundle-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscribe'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should update bundle', async () => {
    mockSuccessResponse({ id: 'bundle-123', amount: 6000 })
    const result = await module.update('bundle-123', { amount: 6000 })
    expect(result.amount).toBe(6000)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/bundle-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should add subscriptions to bundle', async () => {
    mockSuccessResponse({ id: 'bundle-123', subscriptions: [{ id: 'sub-1' }, { id: 'sub-2' }] })
    const result = await module.addSubscriptions('bundle-123', ['sub-2'], 6000)
    expect(result.subscriptions).toHaveLength(2)
  })

  it('should remove subscriptions from bundle', async () => {
    mockSuccessResponse({ id: 'bundle-123', subscriptions: [{ id: 'sub-1' }] })
    const result = await module.removeSubscriptions('bundle-123', ['sub-2'], 3000)
    expect(result.subscriptions).toHaveLength(1)
  })

  it('should dissolve bundle', async () => {
    mockSuccessResponse({ success: true, reenabledSubscriptions: ['sub-1', 'sub-2'] })
    const result = await module.dissolve('bundle-123')
    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/bundle-123'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('should list bundles by mangopay user', async () => {
    mockSuccessResponse({ data: [{ id: 'bundle-1' }], pagination: {} })
    const result = await module.listByMangopayUser('user-123', { isActive: true })
    expect(result.data).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('mangopayUserId=user-123'),
      expect.any(Object)
    )
  })

  it('should activate bundle', async () => {
    mockSuccessResponse({ id: 'bundle-123', isActive: true })
    const result = await module.activate('bundle-123')
    expect(result.isActive).toBe(true)
  })

  it('should deactivate bundle', async () => {
    mockSuccessResponse({ id: 'bundle-123', isActive: false })
    const result = await module.deactivate('bundle-123')
    expect(result.isActive).toBe(false)
  })
})

describe('ProductsModule', () => {
  let client: HttpClient
  let module: ProductsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new ProductsModule(client)
  })

  it('should list products', async () => {
    mockSuccessResponse({ data: [{ id: 'prod-1' }], pagination: {} })
    const result = await module.list()
    expect(result.data).toHaveLength(1)
  })

  it('should list products with filters', async () => {
    mockSuccessResponse({ data: [{ id: 'prod-1' }], pagination: {} })
    const result = await module.list({ isActive: true, page: 1, per_page: 10 })
    expect(result.data).toHaveLength(1)
  })

  it('should get product by id', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Test Product' })
    const result = await module.getById('prod-123')
    expect(result.id).toBe('prod-123')
  })

  it('should get product by external id', async () => {
    mockSuccessResponse({ id: 'prod-123', externalId: 'ext-123' })
    const result = await module.getByExternalId('ext-123')
    expect(result.externalId).toBe('ext-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/external/ext-123'),
      expect.any(Object)
    )
  })

  it('should get product by name', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Premium Plan' })
    const result = await module.getByName('Premium Plan')
    expect(result.name).toBe('Premium Plan')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/name/Premium%20Plan'),
      expect.any(Object)
    )
  })

  it('should create product', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'New Product' })
    const result = await module.create({
      name: 'New Product',
      monthlyPrice: 1000,
      yearlyPrice: 10000,
      currency: 'EUR',
    })
    expect(result.id).toBe('prod-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should update product', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Updated Product' })
    const result = await module.update('prod-123', { name: 'Updated Product' })
    expect(result.name).toBe('Updated Product')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/prod-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should upsert product by external id', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Upserted Product', _created: true })
    const result = await module.upsertByExternalId('ext-123', {
      name: 'Upserted Product',
      monthlyPrice: 1000,
      yearlyPrice: 10000,
    })
    expect(result._created).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/external/ext-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should upsert product by name', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Premium Plan', _created: false })
    const result = await module.upsertByName('Premium Plan', {
      monthlyPrice: 1500,
      yearlyPrice: 15000,
    })
    expect(result._created).toBe(false)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/name/Premium%20Plan'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should remove product', async () => {
    mockSuccessResponse({ success: true })
    const result = await module.remove('prod-123')
    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/prod-123'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('should activate product', async () => {
    mockSuccessResponse({ id: 'prod-123', isActive: true })
    const result = await module.activate('prod-123')
    expect(result.isActive).toBe(true)
  })

  it('should deactivate product', async () => {
    mockSuccessResponse({ id: 'prod-123', isActive: false })
    const result = await module.deactivate('prod-123')
    expect(result.isActive).toBe(false)
  })

  it('should find product by external id', async () => {
    mockSuccessResponse({ id: 'prod-123', externalId: 'ext-123' })
    const result = await module.findByExternalId('ext-123')
    expect(result?.id).toBe('prod-123')
  })

  it('should return null when product not found by external id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    })
    const result = await module.findByExternalId('non-existent')
    expect(result).toBeNull()
  })

  it('should find product by name', async () => {
    mockSuccessResponse({ id: 'prod-123', name: 'Premium Plan' })
    const result = await module.findByName('Premium Plan')
    expect(result?.id).toBe('prod-123')
  })

  it('should return null when product not found by name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    })
    const result = await module.findByName('Non Existent')
    expect(result).toBeNull()
  })
})

describe('PromotionsModule', () => {
  let client: HttpClient
  let module: PromotionsModule

  beforeEach(() => {
    vi.clearAllMocks()
    client = createMockClient()
    module = new PromotionsModule(client)
  })

  // ==========================================
  // COUPONS
  // ==========================================

  it('should create coupon with percent discount', async () => {
    mockSuccessResponse({
      success: true,
      coupon: {
        id: 'coup-123',
        name: 'Welcome Discount',
        discountType: 'percent',
        percentOff: 25,
        duration: 'forever',
      },
    })
    const result = await module.createCoupon({
      name: 'Welcome Discount',
      discountType: 'percent',
      percentOff: 25,
      duration: 'forever',
    })
    expect(result.success).toBe(true)
    expect(result.coupon.id).toBe('coup-123')
    expect(result.coupon.percentOff).toBe(25)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/coupons'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should create coupon with fixed amount discount', async () => {
    mockSuccessResponse({
      success: true,
      coupon: {
        id: 'coup-456',
        name: 'Launch Offer',
        discountType: 'fixed_amount',
        amountOff: 1000,
        currency: 'EUR',
        duration: 'repeating',
        durationInBillingCycles: 3,
      },
    })
    const result = await module.createCoupon({
      name: 'Launch Offer',
      discountType: 'fixed_amount',
      amountOff: 1000,
      currency: 'EUR',
      duration: 'repeating',
      durationInBillingCycles: 3,
    })
    expect(result.success).toBe(true)
    expect(result.coupon.discountType).toBe('fixed_amount')
    expect(result.coupon.amountOff).toBe(1000)
    expect(result.coupon.durationInBillingCycles).toBe(3)
  })

  it('should get coupon by id', async () => {
    mockSuccessResponse({
      success: true,
      coupon: {
        id: 'coup-123',
        name: 'Welcome Discount',
        discountType: 'percent',
        percentOff: 25,
      },
    })
    const result = await module.getCoupon('coup-123')
    expect(result.success).toBe(true)
    expect(result.coupon.id).toBe('coup-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/coupons/coup-123'),
      expect.any(Object)
    )
  })

  it('should list coupons', async () => {
    mockSuccessResponse({
      success: true,
      coupons: [
        { id: 'coup-1', name: 'Coupon 1' },
        { id: 'coup-2', name: 'Coupon 2' },
      ],
      meta: { total: 2, perPage: 20, currentPage: 1, lastPage: 1, firstPage: 1 },
    })
    const result = await module.listCoupons()
    expect(result.success).toBe(true)
    expect(result.coupons).toHaveLength(2)
    expect(result.meta.total).toBe(2)
  })

  it('should list coupons with filters', async () => {
    mockSuccessResponse({
      success: true,
      coupons: [{ id: 'coup-1', name: 'Active Coupon', isActive: true }],
      meta: { total: 1, perPage: 20, currentPage: 1, lastPage: 1, firstPage: 1 },
    })
    const result = await module.listCoupons({
      isActive: true,
      discountType: 'percent',
      page: 1,
      per_page: 10,
    })
    expect(result.success).toBe(true)
    expect(result.coupons).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('isActive=true'),
      expect.any(Object)
    )
  })

  it('should update coupon', async () => {
    mockSuccessResponse({
      success: true,
      coupon: {
        id: 'coup-123',
        name: 'Updated Coupon',
        maxRedemptions: 100,
      },
    })
    const result = await module.updateCoupon('coup-123', {
      name: 'Updated Coupon',
      maxRedemptions: 100,
    })
    expect(result.success).toBe(true)
    expect(result.coupon.name).toBe('Updated Coupon')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/coupons/coup-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should delete coupon', async () => {
    mockSuccessResponse({ success: true })
    const result = await module.deleteCoupon('coup-123')
    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/coupons/coup-123'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('should get coupon stats', async () => {
    mockSuccessResponse({
      success: true,
      stats: {
        totalCoupons: 10,
        activeCoupons: 8,
        totalRedemptions: 150,
        totalDiscountAmount: 75000,
      },
    })
    const result = await module.getCouponStats()
    expect(result.success).toBe(true)
    expect(result.stats.totalCoupons).toBe(10)
    expect(result.stats.activeCoupons).toBe(8)
    expect(result.stats.totalRedemptions).toBe(150)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/coupons/stats'),
      expect.any(Object)
    )
  })

  // ==========================================
  // PROMOTION CODES
  // ==========================================

  it('should create promotion code', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: {
        id: 'promo-123',
        couponId: 'coup-123',
        code: 'BIENVENUE25',
        maxRedemptions: 100,
      },
    })
    const result = await module.createPromotionCode({
      couponId: 'coup-123',
      code: 'BIENVENUE25',
      maxRedemptions: 100,
    })
    expect(result.success).toBe(true)
    expect(result.promotionCode.code).toBe('BIENVENUE25')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should create promotion code with all options', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: {
        id: 'promo-456',
        couponId: 'coup-123',
        code: 'VIP50',
        firstTimeOnly: true,
        minimumAmount: 5000,
        expiresAt: '2025-12-31T23:59:59Z',
      },
    })
    const result = await module.createPromotionCode({
      couponId: 'coup-123',
      code: 'VIP50',
      firstTimeOnly: true,
      minimumAmount: 5000,
      restrictedToUsers: ['user-1', 'user-2'],
      expiresAt: '2025-12-31T23:59:59Z',
      metadata: { campaign: 'vip' },
    })
    expect(result.success).toBe(true)
    expect(result.promotionCode.firstTimeOnly).toBe(true)
  })

  it('should get promotion code by id', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: {
        id: 'promo-123',
        code: 'BIENVENUE25',
        redemptionsCount: 5,
      },
    })
    const result = await module.getPromotionCode('promo-123')
    expect(result.success).toBe(true)
    expect(result.promotionCode.id).toBe('promo-123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/promo-123'),
      expect.any(Object)
    )
  })

  it('should list promotion codes', async () => {
    mockSuccessResponse({
      success: true,
      promotionCodes: [
        { id: 'promo-1', code: 'CODE1' },
        { id: 'promo-2', code: 'CODE2' },
      ],
      meta: { total: 2, perPage: 20, currentPage: 1, lastPage: 1, firstPage: 1 },
    })
    const result = await module.listPromotionCodes()
    expect(result.success).toBe(true)
    expect(result.promotionCodes).toHaveLength(2)
  })

  it('should list promotion codes with filters', async () => {
    mockSuccessResponse({
      success: true,
      promotionCodes: [{ id: 'promo-1', code: 'CODE1', couponId: 'coup-123' }],
      meta: { total: 1, perPage: 20, currentPage: 1, lastPage: 1, firstPage: 1 },
    })
    const result = await module.listPromotionCodes({
      couponId: 'coup-123',
      isActive: true,
    })
    expect(result.success).toBe(true)
    expect(result.promotionCodes).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('couponId=coup-123'),
      expect.any(Object)
    )
  })

  it('should update promotion code', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: {
        id: 'promo-123',
        maxRedemptions: 200,
        isActive: true,
      },
    })
    const result = await module.updatePromotionCode('promo-123', {
      maxRedemptions: 200,
      isActive: true,
    })
    expect(result.success).toBe(true)
    expect(result.promotionCode.maxRedemptions).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/promo-123'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('should delete promotion code', async () => {
    mockSuccessResponse({ success: true })
    const result = await module.deletePromotionCode('promo-123')
    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/promo-123'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('should validate promotion code successfully', async () => {
    mockSuccessResponse({
      success: true,
      valid: true,
      discount: {
        type: 'percent',
        value: 25,
        amountOff: 750,
        finalAmount: 2250,
      },
      coupon: {
        name: 'Welcome Discount',
        duration: 'forever',
        durationInBillingCycles: null,
      },
    })
    const result = await module.validateCode({
      code: 'BIENVENUE25',
      productType: 'mbc',
      amount: 3000,
    })
    expect(result.success).toBe(true)
    expect(result.valid).toBe(true)
    expect(result.discount?.amountOff).toBe(750)
    expect(result.discount?.finalAmount).toBe(2250)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/validate'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should validate promotion code with invalid code', async () => {
    mockSuccessResponse({
      success: true,
      valid: false,
      error: 'Code not found or expired',
    })
    const result = await module.validateCode({
      code: 'INVALID',
      amount: 3000,
    })
    expect(result.success).toBe(true)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Code not found or expired')
  })

  it('should generate multiple promotion codes', async () => {
    mockSuccessResponse({
      success: true,
      couponId: 'coup-123',
      codesGenerated: 10,
      codes: [
        { id: 'promo-1', code: 'PROMO001' },
        { id: 'promo-2', code: 'PROMO002' },
        { id: 'promo-3', code: 'PROMO003' },
        { id: 'promo-4', code: 'PROMO004' },
        { id: 'promo-5', code: 'PROMO005' },
        { id: 'promo-6', code: 'PROMO006' },
        { id: 'promo-7', code: 'PROMO007' },
        { id: 'promo-8', code: 'PROMO008' },
        { id: 'promo-9', code: 'PROMO009' },
        { id: 'promo-10', code: 'PROMO010' },
      ],
    })
    const result = await module.generateCodes({
      couponId: 'coup-123',
      count: 10,
      prefix: 'PROMO',
      maxRedemptions: 1,
    })
    expect(result.success).toBe(true)
    expect(result.codesGenerated).toBe(10)
    expect(result.codes).toHaveLength(10)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/generate'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should generate codes with all options', async () => {
    mockSuccessResponse({
      success: true,
      couponId: 'coup-123',
      codesGenerated: 5,
      codes: [
        { id: 'promo-1', code: 'SUMMER001' },
        { id: 'promo-2', code: 'SUMMER002' },
        { id: 'promo-3', code: 'SUMMER003' },
        { id: 'promo-4', code: 'SUMMER004' },
        { id: 'promo-5', code: 'SUMMER005' },
      ],
    })
    const result = await module.generateCodes({
      couponId: 'coup-123',
      count: 5,
      prefix: 'SUMMER',
      maxRedemptions: 1,
      firstTimeOnly: true,
      expiresAt: '2025-09-30T23:59:59Z',
    })
    expect(result.success).toBe(true)
    expect(result.codesGenerated).toBe(5)
  })

  it('should find promotion code by code string', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: {
        id: 'promo-123',
        code: 'BIENVENUE25',
        couponId: 'coup-123',
        isActive: true,
      },
    })
    const result = await module.findByCode('BIENVENUE25')
    expect(result.success).toBe(true)
    expect(result.promotionCode?.code).toBe('BIENVENUE25')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/promotions/codes/by-code/BIENVENUE25'),
      expect.any(Object)
    )
  })

  it('should return null when code not found', async () => {
    mockSuccessResponse({
      success: true,
      promotionCode: null,
    })
    const result = await module.findByCode('NONEXISTENT')
    expect(result.success).toBe(true)
    expect(result.promotionCode).toBeNull()
  })
})
