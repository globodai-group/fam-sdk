/**
 * Users module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { BankAccount } from '../types/bank-accounts.js'
import type { Card } from '../types/cards.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'
import type {
  CreateLegalUserRequest,
  CreateNaturalUserRequest,
  LegalUser,
  NaturalUser,
  UpdateLegalUserRequest,
  UpdateNaturalUserRequest,
  User,
} from '../types/users.js'
import type { Wallet } from '../types/wallets.js'

/**
 * Transaction list item (simplified for user transactions)
 */
interface Transaction {
  Id: string
  Tag?: string
  CreationDate: number
  AuthorId: string
  Type: string
  Nature: string
  Status: string
  DebitedFunds: { Amount: number; Currency: string }
  CreditedFunds: { Amount: number; Currency: string }
  Fees: { Amount: number; Currency: string }
}

/**
 * Users API module
 */
export class UsersModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/users')
  }

  /**
   * Create a natural user
   */
  async createNatural(data: CreateNaturalUserRequest): Promise<NaturalUser> {
    return this.post<NaturalUser>('natural', data)
  }

  /**
   * Create a legal user
   */
  async createLegal(data: CreateLegalUserRequest): Promise<LegalUser> {
    return this.post<LegalUser>('legal', data)
  }

  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    return this.client.get<User>(this.path(userId))
  }

  /**
   * Get a natural user by ID
   */
  async getNaturalUser(userId: string): Promise<NaturalUser> {
    return this.client.get<NaturalUser>(this.path(['natural', userId]))
  }

  /**
   * Get a legal user by ID
   */
  async getLegalUser(userId: string): Promise<LegalUser> {
    return this.client.get<LegalUser>(this.path(['legal', userId]))
  }

  /**
   * Update a natural user
   */
  async updateNatural(userId: string, data: UpdateNaturalUserRequest): Promise<NaturalUser> {
    return this.put<NaturalUser>(`natural/${userId}`, data)
  }

  /**
   * Update a legal user
   */
  async updateLegal(userId: string, data: UpdateLegalUserRequest): Promise<LegalUser> {
    return this.put<LegalUser>(`legal/${userId}`, data)
  }

  /**
   * Get user's wallets
   */
  async getWallets(userId: string, params?: PaginationParams): Promise<PaginatedResponse<Wallet>> {
    return this.client.get<PaginatedResponse<Wallet>>(this.path([userId, 'wallets']), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get user's cards
   */
  async getCards(userId: string, params?: PaginationParams): Promise<PaginatedResponse<Card>> {
    return this.client.get<PaginatedResponse<Card>>(this.path([userId, 'cards']), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get user's bank accounts
   */
  async getBankAccounts(
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<BankAccount>> {
    return this.client.get<PaginatedResponse<BankAccount>>(this.path([userId, 'bankaccounts']), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get user's transactions
   */
  async getTransactions(
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Transaction>> {
    return this.client.get<PaginatedResponse<Transaction>>(this.path([userId, 'transactions']), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }
}
