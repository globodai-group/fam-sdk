/**
 * Main SDK client class
 */

import { HttpClient } from './client.js'
import {
  BankAccountsModule,
  BundlesModule,
  CardRegistrationsModule,
  CardsModule,
  KycModule,
  PayinsModule,
  PayoutsModule,
  PortalModule,
  PreauthorizationsModule,
  ProductsModule,
  ScaRecipientsModule,
  SubscriptionsModule,
  TransfersModule,
  UboModule,
  UsersModule,
  WalletsModule,
} from './modules/index.js'
import type { FamOptions } from './client.js'

/**
 * Main FAM SDK client
 *
 * @example
 * ```typescript
 * const client = new Fam({
 *   baseUrl: 'https://api.fam.com',
 *   token: 'your-auth-token',
 * })
 *
 * // Create a natural user
 * const user = await client.users.createNatural({
 *   Email: 'user@example.com',
 *   FirstName: 'John',
 *   LastName: 'Doe',
 * })
 *
 * // Create a wallet
 * const wallet = await client.wallets.create({
 *   Owners: [user.Id],
 *   Description: 'Main wallet',
 *   Currency: 'EUR',
 * })
 * ```
 */
export class Fam {
  private readonly client: HttpClient

  // Core modules
  public readonly users: UsersModule
  public readonly wallets: WalletsModule
  public readonly payins: PayinsModule
  public readonly payouts: PayoutsModule
  public readonly transfers: TransfersModule

  // Card modules
  public readonly cards: CardsModule
  public readonly cardRegistrations: CardRegistrationsModule
  public readonly preauthorizations: PreauthorizationsModule

  // FAM custom modules
  public readonly subscriptions: SubscriptionsModule
  public readonly bundles: BundlesModule
  public readonly products: ProductsModule
  public readonly portal: PortalModule

  constructor(options: FamOptions) {
    this.client = new HttpClient(options)

    // Initialize core modules
    this.users = new UsersModule(this.client)
    this.wallets = new WalletsModule(this.client)
    this.payins = new PayinsModule(this.client)
    this.payouts = new PayoutsModule(this.client)
    this.transfers = new TransfersModule(this.client)

    // Initialize card modules
    this.cards = new CardsModule(this.client)
    this.cardRegistrations = new CardRegistrationsModule(this.client)
    this.preauthorizations = new PreauthorizationsModule(this.client)

    // Initialize FAM custom modules
    this.subscriptions = new SubscriptionsModule(this.client)
    this.bundles = new BundlesModule(this.client)
    this.products = new ProductsModule(this.client)
    this.portal = new PortalModule(this.client)
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.client.setToken(token)
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.client.clearToken()
  }

  /**
   * Get bank accounts module for a specific user
   */
  bankAccounts(userId: string): BankAccountsModule {
    return new BankAccountsModule(this.client, userId)
  }

  /**
   * Get KYC module for a specific user
   */
  kyc(userId: string): KycModule {
    return new KycModule(this.client, userId)
  }

  /**
   * Get UBO module for a specific user
   */
  ubo(userId: string): UboModule {
    return new UboModule(this.client, userId)
  }

  /**
   * Get SCA Recipients module for a specific user
   */
  scaRecipients(userId: string): ScaRecipientsModule {
    return new ScaRecipientsModule(this.client, userId)
  }
}
