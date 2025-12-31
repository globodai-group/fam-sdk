/**
 * Bank Accounts module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  BankAccount,
  CreateCaBankAccountRequest,
  CreateGbBankAccountRequest,
  CreateIbanBankAccountRequest,
  CreateOtherBankAccountRequest,
  CreateUsBankAccountRequest,
  IbanBankAccount,
  GbBankAccount,
  UsBankAccount,
  CaBankAccount,
  OtherBankAccount,
} from '../types/bank-accounts.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'

/**
 * Bank Accounts API module (user-scoped)
 */
export class BankAccountsModule extends BaseModule {
  constructor(client: HttpClient, userId: string) {
    super(client, `/api/v1/mangopay/users/${userId}/bankaccounts`)
  }

  /**
   * Create an IBAN bank account
   */
  async createIban(data: CreateIbanBankAccountRequest): Promise<IbanBankAccount> {
    return this.post<IbanBankAccount>('iban', data)
  }

  /**
   * Create a GB bank account
   */
  async createGb(data: CreateGbBankAccountRequest): Promise<GbBankAccount> {
    return this.post<GbBankAccount>('gb', data)
  }

  /**
   * Create a US bank account
   */
  async createUs(data: CreateUsBankAccountRequest): Promise<UsBankAccount> {
    return this.post<UsBankAccount>('us', data)
  }

  /**
   * Create a CA bank account
   */
  async createCa(data: CreateCaBankAccountRequest): Promise<CaBankAccount> {
    return this.post<CaBankAccount>('ca', data)
  }

  /**
   * Create an Other bank account
   */
  async createOther(data: CreateOtherBankAccountRequest): Promise<OtherBankAccount> {
    return this.post<OtherBankAccount>('other', data)
  }

  /**
   * Get a bank account by ID
   */
  async getAccount(accountId: string): Promise<BankAccount> {
    return this.client.get<BankAccount>(this.path(accountId))
  }

  /**
   * List user's bank accounts
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<BankAccount>> {
    return this.client.get<PaginatedResponse<BankAccount>>(this.path(''), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Deactivate a bank account
   */
  async deactivate(accountId: string): Promise<BankAccount> {
    return this.put<BankAccount>(accountId, { Active: false })
  }
}
